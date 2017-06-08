import React from 'react'
import { storiesOf } from '@kadira/storybook'
import { text } from '@kadira/storybook-addon-knobs'
import BlockChecked from './index'

const defaultChecked = {
  title: 'Эконом Базовый',
  description: 'Описание',
  price: '12 234 ₽',
  topIcon: ['plane'],
  bottomIcon: ['hand-baggage', 'exchange', 'return'],
}

storiesOf('BlockChecked', module)
  .addWithInfo('default', () => {
    const title = text('title', defaultChecked.title)
    const description = text('description', defaultChecked.description)
    const price = text('price', defaultChecked.price)

    return (
      <div>
        <BlockChecked
          htmlFor="name1"
          name="radio1"
          title="Банковской картой он-лайн"
          price={price}
          iconsPosition="top"
          icons={defaultChecked.topIcon}
          value="name1"
          description={description}
        />
        <BlockChecked
          htmlFor="name2"
          name="radio1"
          title={title}
          price={price}
          iconsPosition="bottom"
          icons={defaultChecked.bottomIcon}
          value="name2"
          description={description}
        />
        <BlockChecked
          htmlFor="name3"
          name="radio1"
          title="Эконом"
          price={price}
          iconsPosition="bottom"
          icons={defaultChecked.bottomIcon}
          value="name3"
          description={description}
        />
      </div>
    )
  })
