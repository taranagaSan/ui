import React from 'react'
import { storiesOf } from '@storybook/react'

import { FluidContainer, FluidSection, Aside, SingleFluidSection } from 'components/FluidLayout'

const MainContent = () => (
  <div
    style={{
      background: 'rgba(35, 194, 86, .4)',
      height: 140,
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
    }}
  >
    Main content
  </div>
)

const AsideContent = () => (
  <div
    style={{
      height: 140,
      background: 'rgba(230, 73, 38, .4)',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
    }}
  >
    Sidebar
  </div>
)

storiesOf('COMPONENTS|Layout/Fluid layout', module)
  .addDecorator((story) => (
    <div style={{ width: '100vw' }}>
      { story() }
    </div>
  ))
  .add(
    'Two columns',
    () => (
      <FluidContainer>
        <FluidSection>
          <MainContent />
        </FluidSection>
        <Aside>
          <AsideContent />
        </Aside>
      </FluidContainer>
    ),
  )
  .add(
    'Aside on top with beforeSection prop',
    () => (
      <FluidContainer>
        <FluidSection>
          <MainContent />
        </FluidSection>
        <Aside beforeSection>
          <AsideContent />
        </Aside>
      </FluidContainer>
    ),
  )
  .add('Single column', () => (
    <SingleFluidSection>
      <MainContent />
    </SingleFluidSection>
  ))
