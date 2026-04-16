import React from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { View } from 'react-native'
import { NText } from '@imjohnkoo/design-mobile'

const meta = {
  title: 'Base/NText',
  component: NText,
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'select',
      options: ['h1', 'h2', 'h3', 'body', 'bodySmall', 'caption', 'label'],
    },
    weight: {
      control: 'select',
      options: ['regular', 'medium', 'semibold', 'bold'],
    },
    align: { control: 'select', options: ['left', 'center', 'right'] },
    color: { control: 'color' },
  },
  args: {
    variant: 'body',
    children: '다람쥐 헌 쳇바퀴에 타고파',
  },
} satisfies Meta<typeof NText>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}

export const AllVariants: Story = {
  render: () => (
    <View style={{ gap: 8 }}>
      <NText variant="h1">Heading 1</NText>
      <NText variant="h2">Heading 2</NText>
      <NText variant="h3">Heading 3</NText>
      <NText variant="body">Body</NText>
      <NText variant="bodySmall">Body Small</NText>
      <NText variant="caption">Caption</NText>
      <NText variant="label">Label</NText>
    </View>
  ),
}

export const Weights: Story = {
  render: () => (
    <View style={{ gap: 4 }}>
      <NText weight="regular">Regular (400)</NText>
      <NText weight="medium">Medium (500)</NText>
      <NText weight="semibold">Semibold (600)</NText>
      <NText weight="bold">Bold (700)</NText>
    </View>
  ),
}
