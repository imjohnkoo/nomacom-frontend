import React, { useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { View } from 'react-native'
import { NCheckbox } from '@imjohnkoo/design-mobile'

const meta = {
  title: 'Form/NCheckbox',
  component: NCheckbox,
  tags: ['autodocs'],
  argTypes: {
    label: { control: 'text' },
    disabled: { control: 'boolean' },
  },
  args: { checked: false, label: '이용약관에 동의합니다' },
} satisfies Meta<typeof NCheckbox>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: (args) => {
    const [checked, setChecked] = useState(args.checked)
    return <NCheckbox {...args} checked={checked} onToggle={setChecked} />
  },
}

export const Checked: Story = {
  render: (args) => {
    const [checked, setChecked] = useState(true)
    return <NCheckbox {...args} checked={checked} onToggle={setChecked} />
  },
}

export const Disabled: Story = {
  args: { disabled: true, checked: true },
}

export const CheckboxGroup: Story = {
  render: () => {
    const [a, setA] = useState(true)
    const [b, setB] = useState(false)
    const [c, setC] = useState(false)
    return (
      <View style={{ gap: 12 }}>
        <NCheckbox checked={a} onToggle={setA} label="이메일 수신 동의" />
        <NCheckbox checked={b} onToggle={setB} label="SMS 수신 동의" />
        <NCheckbox checked={c} onToggle={setC} label="마케팅 정보 수신 동의" />
      </View>
    )
  },
}
