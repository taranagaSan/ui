// @flow
import React from 'react'
import styled from 'styled-components'
import mq from 'utils/media-queries'
import Autocomplete from 'components/Autocomplete'
import RFInput, { Input } from 'components/Input'
import Icon from 'components/Icon'
import Suggestion from 'components/Suggestion'
import { shadowSmall } from 'utils/shadows'
import { borderRadiusSmall } from 'utils/borderRadius'
import noop from 'lodash/noop'

const StyledContainer = styled.div`
  margin: 3px 0 0;
  min-width: 90px;
  width: 100%;
  padding: 3px 0;
  position: absolute;
  top: 100%;
  ${shadowSmall}
  ${borderRadiusSmall.all}
  overflow: hidden;
  z-index: 10;
  background: ${({ theme }) => theme.color.background};

  ${mq.mobile`
    padding: 0;
    top: initial;
  `}

`

const SectionHeader = styled.div`
  height: 30px;
  line-height: 30px;
  padding-left: 9px;
  color: ${({ theme }) => theme.color.miscDark};
`

const StyledAutocomplete = styled(Autocomplete)`
  && {
    ${mq.mobile`
      position: relative;
    `}
  }
`


type SectionObject = {
  title?: string,
}
type SuggestionObject = {
  key?: any,
  value?: any,
}
type OnChange = (Event, { newValue: string, method: string }) => void

type Meta = {
  error?: string | React.Element<*>,
  touched?: boolean,
}
type InputProps = {
  value: SuggestionObject | Object | string,
  onChange?: OnChange,
  meta?: Meta,
}

/* eslint-disable react/prop-types */
const defaultInput = ({ isOpen, ...props }) => (
  <Input
    {...props}
    rightIcon={
      <Icon
        name="angle"
        rotate={isOpen}
        fill="miscDark"
      />
    }
  />
)

// Omit ref cause it can't be set for statless RFInput and not really used by react-autowhatever
// eslint-disable-next-line no-unused-vars
const defaultRFInput = ({ isOpen, ref, ...props }) => (
  <RFInput
    {...props}
    rightIcon={
      <Icon
        name="angle"
        rotate={isOpen}
        fill="miscDark"
      />
    }
  />
)

const defaultContainer = ({ containerProps, children }) => (
  <StyledContainer {... containerProps}>
    {children}
  </StyledContainer>
)

const defaultSectionTitle = (section: SectionObject) => (
  <SectionHeader>
    {section.title}
  </SectionHeader>
)

const emptySuggestions = []

type Props = {
  suggestions: SuggestionObject[] | SectionObject[],
  selectedSuggestion: SuggestionObject | Object | string,
  forceSuggestedValue: boolean,
  focusInputOnSuggestionClick: boolean,
  renderInputComponent: (Object) => Element,
  renderSuggestionsContainer: (Object) => Element,
  renderSectionTitle: (Object) => Element,
  renderSuggestion?: (Object) => Element,
  shouldRenderSuggestions: () => boolean,
  getSuggestionValue: (Object) => any,
  getSuggestionKey: (Object) => string,
  onSuggestionSelected?: (Event, {
    suggestion: SuggestionObject,
    suggestionValue: string,
    suggestionIndex: number,
    sectionIndex: ?number,
    method: 'click' | 'enter' | 'blur' | 'autoSuggest'
  }) => void,
  inputProps: InputProps,
}

type State = {
  isOpen: boolean,
}

export class Select extends React.Component <Props, State> {
  static defaultProps = {
    suggestions: [],
    selectedSuggestion: {
      key: '',
      value: '',
    },
    forceSuggestedValue: false,
    focusInputOnSuggestionClick: false,
    renderInputComponent: defaultInput,
    renderSuggestionsContainer: defaultContainer,
    renderSectionTitle: defaultSectionTitle,
    shouldRenderSuggestions: () => true,
    getSuggestionValue: (suggestion: SuggestionObject) => suggestion.value,
    getSuggestionKey: (suggestion: SuggestionObject) => suggestion.key,
    renderSuggestion: (suggestion: SuggestionObject, props) => (
      <Suggestion suggestion={suggestion} {...props} />
    ),
    onSuggestionSelected: noop,
  }

  state = {
    isOpen: false,
  }

  onSuggestionsFetchRequested = () => {
    this.setState({ isOpen: true })
  }

  onSuggestionsClearRequested = () => {
    this.setState({ isOpen: false })
  }

  handleIconPress = (inputNode, event) => {
    event.preventDefault()
    event.stopPropagation()
    const { isOpen } = this.state
    if (isOpen) {
      inputNode.current.blur()
    } else {
      inputNode.current.focus()
    }
  }

  renderSuggestion = (suggestion: {}, { query, isHighlighted }) => {
    const { renderSuggestion, ...props } = this.props
    const { selectedSuggestion, getSuggestionKey } = this.props

    // Respect react-autocomplete signature…
    return renderSuggestion(suggestion, {
      query,
      isHighlighted,
      selectedKey: getSuggestionKey(selectedSuggestion),
      ...props,
    })
  }

  render() {
    const { isOpen } = this.state
    const {
      inputProps,
      suggestions,
      getSuggestionValue,
      renderInputComponent,
      renderSuggestionsContainer,
      selectedSuggestion,
    } = this.props
    return (
      <StyledAutocomplete
        {...this.props}
        suggestions={isOpen ? suggestions : emptySuggestions}
        onSuggestionsFetchRequested={this.onSuggestionsFetchRequested}
        onSuggestionsClearRequested={this.onSuggestionsClearRequested}
        renderSuggestionsContainer={renderSuggestionsContainer}
        renderInputComponent={renderInputComponent}
        renderSuggestion={this.renderSuggestion}
        inputProps={{
          ...inputProps,
          readOnly: true,
          value: getSuggestionValue(selectedSuggestion) || '',
          isOpen,
          onChange: () => {},
          handleRightIconPress: this.handleIconPress,
        }}
      />
    )
  }
}


type RFProps = FieldProps

export default class RFSelect extends React.Component <RFProps, void> {
  onSuggestionSelected = (e, { suggestion }) => {
    const { onChange } = this.props.input
    onChange(suggestion)
  }

  // We can't send actual value or event to RF so omit it
  handleBlur = () => this.props.input.onBlur()

  render() {
    const { input, meta, placeholder } = this.props
    return (
      <Select
        {...this.props}
        onSuggestionSelected={this.onSuggestionSelected}
        selectedSuggestion={input.value}
        renderInputComponent={defaultRFInput}
        inputProps={{
          placeholder,
          meta,
          ...input,
          onBlur: this.handleBlur,
        }}
      />
    )
  }
}
