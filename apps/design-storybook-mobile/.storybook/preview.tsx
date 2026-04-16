import React from 'react'
import type { Preview } from '@storybook/react'
import { View } from 'react-native'

/**
 * Padding decorator for individual component stories.
 * Page stories opt out by setting parameters.padding = false.
 */
const preview: Preview = {
  decorators: [
    (Story, context) => {
      const noPadding = context.parameters.padding === false
      return (
        <View
          style={{
            padding: noPadding ? 0 : 16,
            backgroundColor: '#ffffff',
            width: '100%',
            minHeight: noPadding ? '100vh' : 200,
          }}
        >
          <Story />
        </View>
      )
    },
  ],
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
    layout: 'fullscreen',
    backgrounds: {
      default: 'light',
      values: [
        { name: 'light', value: '#f5f5f5' },
        { name: 'dark', value: '#1a1a1a' },
        { name: 'white', value: '#ffffff' },
      ],
    },
    viewport: {
      viewports: {
        iphoneSE: { name: 'iPhone SE', styles: { width: '375px', height: '667px' } },
        iphone14: { name: 'iPhone 14', styles: { width: '390px', height: '844px' } },
        iphone14ProMax: { name: 'iPhone 14 Pro Max', styles: { width: '430px', height: '932px' } },
      },
    },
  },
}

export default preview
