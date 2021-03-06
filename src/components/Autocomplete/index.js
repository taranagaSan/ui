// @flow
// https://github.com/brigand/babel-plugin-flow-react-proptypes/issues/71#issuecomment-295771268

'no babel-plugin-flow-react-proptypes'

import React, { PureComponent } from 'react'
import styled from 'styled-components'
import PropTypes from 'prop-types'

import Autosuggest from 'react-autosuggest'
import createSectionIterator from 'section-iterator'
import _get from 'lodash/get'
import type { controlsGroupProps } from 'components/ControlsGroup'

import style, { SuggestionsContainer } from './styled'


// Includes cyrylic unicode range
// http://jrgraphix.net/r/Unicode/0400-04FF
const NON_LETTERS_REGEXP = /[^\w\u0400-\u04FF]/g

const isValuesEqual = (a, b) => {
  /* eslint-disable no-underscore-dangle */
  const _a = (a ? String(a) : '').toLowerCase().replace(NON_LETTERS_REGEXP, '')
  const _b = (b ? String(b) : '').toLowerCase().replace(NON_LETTERS_REGEXP, '')

  // Not empty and same
  return Boolean(_a && _a === _b)
}

export const AUTOSUGGEST_METHODS = {
  SELECT_RIGHT_ARROW: 'AUTOSUGGEST_SELECT_RIGHT_ARROW',
  SELECT_LAST_EQUAL_SUGGEST: 'AUTOSUGGEST_SELECT_LAST_EQUAL_SUGGEST',
}

const emptyArray = []

type Section = {}
type Suggestion = {}
type onChange = (Event, { newValue: string, method: string }) => void

type Props = controlsGroupProps & {
  forceSuggestedValue: boolean,
  suggestions: Suggestion[] | Section[],

  onSuggestionsFetchRequested: ({ value: string }) => any,
  onSuggestionsClearRequested: () => void,
  onSuggestionSelected: (Event, {
    suggestion: Object,
    suggestionValue: string,
    suggestionIndex: number,
    sectionIndex: ?number,
    method: 'click' | 'enter' | 'blur' | 'autoSuggest'
  }) => void,
  renderInputComponent: ?({}) => React.Element<*>,
  getSuggestionValue: (Suggestion) => string,
  renderSuggestion: ?(Suggestion, {query: string}) => React.Element<*>,
  inputProps: {
    value: string,
    onChange: onChange,
    // can be proxied from redux-form
    meta?: {
      error: string,
    }
  },
  shouldRenderSuggestions: ?string => boolean,
  alwaysRenderSuggestions: ?boolean,
  multiSection: ?boolean,
  renderSectionTitle: ?(Object) => React.Element<*>,
  getSectionSuggestions: Object => Suggestion[],
  focusInputOnSuggestionClick: ?boolean,
  highlightFirstSuggestion: boolean,
  theme: ?Object,
  id: ?string,

  isSuggestAlreadySelected?: (props: Props) => boolean,
  isValueEqualWithFirstSugget?: (string, Suggestion[]) => boolean,
}

type State = {
  suggestions: Suggestion[],
}

const getFirstSuggestion = ({ suggestions, multiSection }: Props) => {
  let [suggestion] = suggestions
  if (multiSection && suggestion) {
    // destructuring dosn't work for assignment in babel
    // eslint-disable-next-line prefer-destructuring
    suggestion = suggestion[0]
  }

  return suggestion || null
}

const getSectionIterator = ({ multiSection, suggestions, getSectionSuggestions }: Props) => (
  createSectionIterator({
    multiSection,
    data: multiSection
      ? suggestions.map((section) => getSectionSuggestions(section).length)
      : suggestions.length,
  })
)

class Autocomplete extends PureComponent<Props, State> {
  /* eslint-disable react/sort-comp */
  state = {
    suggestions: this.props.suggestions || [],
  }

  sectionIterator: createSectionIterator = getSectionIterator(this.props)
  autosuggestInstance: Autosuggest = null
  userAreTyping: ?boolean = true

  static propTypes = {
    ...Autosuggest.propTypes,
    forceSuggestedValue: PropTypes.bool,
  }

  static defaultProps = {
    ...Autosuggest.defaultProps,
    highlightFirstSuggestion: true,
    getSuggestionValue: (suggestion) => suggestion.value,
    getSectionSuggestions: (section) => section.values,
    forceSuggestedValue: true,
    renderSuggestionsContainer: ({ containerProps, children, query }) => (
      <SuggestionsContainer query={query} {...containerProps}>
        {children}
      </SuggestionsContainer>
    ),
    isSuggestAlreadySelected: (props) => Boolean(props.inputProps.IATACode),
    isValueEqualWithFirstSuggest: (value, suggestions) => (
      isValuesEqual(value, _get(suggestions, '0.value'))
      || isValuesEqual(value, _get(suggestions, '0.IATACode'))
    ),
  }
  /* eslint-enable react/sort-comp */

  // TODO airbnb config for `react/sort-comp` are missing UNSAFE_ lifecycles
  // eslint-disable-next-line camelcase, react/sort-comp
  UNSAFE_componentWillReceiveProps(nextProps: Props) {
    const {
      suggestions,
      multiSection,
      inputProps,
      forceSuggestedValue,
      isSuggestAlreadySelected,
      isValueEqualWithFirstSuggest,
    } = nextProps
    const { value, meta } = inputProps

    const valueIsEqualWithFirstSuggest = isValueEqualWithFirstSuggest(value, suggestions)
    const suggestIsAlreadySelected = isSuggestAlreadySelected(nextProps)

    if (valueIsEqualWithFirstSuggest && !suggestIsAlreadySelected && suggestions.length === 1) {
      this.selectFirstSuggest(null, nextProps, AUTOSUGGEST_METHODS.SELECT_LAST_EQUAL_SUGGEST)
      this.setState({ suggestions: [] })
    } else if (forceSuggestedValue && suggestions.length && meta && !meta.active) {
      this.selectFirstSuggest(null, nextProps, 'autoFill')
      this.setState({ suggestions: [] })
    } else {
      this.setState({ suggestions })
    }

    if (suggestions !== this.props.suggestions || multiSection !== this.props.multiSection) {
      this.sectionIterator = getSectionIterator(nextProps)
    }
  }

  onChange: onChange = (event, payload) => {
    const { highlightedSectionIndex, highlightedSuggestionIndex } = this.autosuggestInstance.state
    const userAreTyping = payload.newValue.length >= this.props.inputProps.value.length

    let suggestion = null
    if (['down', 'up'].includes(payload.method)) {
      const iterate = this.sectionIterator[payload.method === 'down' ? 'next' : 'prev']
      const [sectionIndex, suggestIndex] = iterate([
        highlightedSectionIndex,
        highlightedSuggestionIndex,
      ])
      suggestion = this.autosuggestInstance.getSuggestion(sectionIndex, suggestIndex)
    }

    this.props.inputProps.onChange(event, {
      ...payload,
      suggestion,
    })

    this.userAreTyping = userAreTyping
  }

  onBlur = (event: Event) => {
    if (this.props.inputProps.onBlur) {
      this.props.inputProps.onBlur(event)
    }

    if (!this.autosuggestInstance || !this.autosuggestInstance.justSelectedSuggestion) {
      if (this.props.forceSuggestedValue) {
        this.selectFirstSuggest(event, this.props, 'blur')
      }
    }
  }

  onKeyDown = (event: KeyboardEvent) => {
    const { suggestions, inputProps } = this.props

    if (inputProps.onKeyDown) {
      inputProps.onKeyDown(event)
    }

    if (event.key === 'ArrowRight' && suggestions.length) {
      this.selectFirstSuggest(null, this.props, AUTOSUGGEST_METHODS.SELECT_RIGHT_ARROW)
    }
  }

  selectFirstSuggest(event: ?Event, props: Props, method: string) {
    const { getSuggestionValue, alwaysRenderSuggestions, multiSection } = props
    const suggestion = getFirstSuggestion(props)

    const { isFocused, isCollapsed } = this.autosuggestInstance.state

    const willRenderSuggestions = this.autosuggestInstance.willRenderSuggestions(this.props)
    const isOpen = alwaysRenderSuggestions || isFocused && !isCollapsed && willRenderSuggestions

    if (isOpen && !alwaysRenderSuggestions) {
      this.autosuggestInstance.closeSuggestions()
    }

    const ALLOWED_METHODS = [
      'blur',
      AUTOSUGGEST_METHODS.SELECT_RIGHT_ARROW,
      AUTOSUGGEST_METHODS.SELECT_LAST_EQUAL_SUGGEST,
      'autoFill',
    ]

    if (suggestion && (this.userAreTyping || ALLOWED_METHODS.includes(method))) {
      const newValue = getSuggestionValue(suggestion)

      this.autosuggestInstance.maybeCallOnChange(event, newValue, method)

      this.autosuggestInstance.onSuggestionSelected(event, {
        suggestion,
        suggestionValue: newValue,
        suggestionIndex: 0,
        sectionIndex: multiSection ? 0 : null,
        method,
      })

      this.autosuggestInstance.justSelectedSuggestion = true

      // Autosuggest differentiates props updates
      // caused by arrow-keys navigation from other updates
      // https://github.com/moroshko/react-autosuggest/blob/master/src/Autosuggest.js#L366
      setTimeout(() => {
        if (this.autosuggestInstance) {
          this.autosuggestInstance.justSelectedSuggestion = false
        }
      }, 0)
    } else if (!suggestion) {
      this.autosuggestInstance.maybeCallOnChange(event, '', method)
    }
  }

  render() {
    const { suggestions = emptyArray } = this.state
    // Pass neighboringInGroup prop to input
    const { neighboringInGroup, inputProps, size, className, ...props } = this.props
    const spell = suggestions.length && this.props.getSuggestionValue(suggestions[0]) || ''

    return (
      <Autosuggest
        {...props}
        inputProps={{
          neighboringInGroup,
          ...inputProps,
          onChange: this.onChange,
          onBlur: this.onBlur,
          onKeyDown: this.onKeyDown,
          spell,
          size,
        }}
        suggestions={suggestions}
        ref={(ref) => { this.autosuggestInstance = ref }}
        theme={{
          // Pass `className` into Autosuggest theme. The `container` is className for root block
          ...Autosuggest.defaultProps.theme,
          container: className,
        }}
      />
    )
  }
}

const StyledAutocomplete = styled(Autocomplete)`
  ${style}
`

export default StyledAutocomplete
