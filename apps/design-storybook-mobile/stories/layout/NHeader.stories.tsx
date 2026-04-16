import React from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { Text } from 'react-native'
import { NHeader } from '@imjohnkoo/design-mobile'

const meta = {
  title: 'Layout/NHeader',
  component: NHeader,
  tags: ['autodocs'],
  argTypes: {
    title: { control: 'text' },
    subtitle: { control: 'text' },
    transparent: { control: 'boolean' },
    onLeftPress: { action: 'leftPressed' },
    onRightPress: { action: 'rightPressed' },
  },
  args: { title: '페이지 제목' },
} satisfies Meta<typeof NHeader>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}
export const WithSubtitle: Story = { args: { subtitle: '부제목 텍스트' } }

export const WithIcons: Story = {
  args: {
    leftIcon: <Text style={{ fontSize: 18 }}>←</Text>,
    rightIcon: <Text style={{ fontSize: 18 }}>⋯</Text>,
  },
}

export const Transparent: Story = {
  args: {
    transparent: true,
    leftIcon: <Text style={{ fontSize: 18 }}>←</Text>,
  },
}
