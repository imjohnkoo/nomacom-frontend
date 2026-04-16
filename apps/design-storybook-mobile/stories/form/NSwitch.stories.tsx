import React, { useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { View } from 'react-native'
import { NSwitch } from '@imjohnkoo/design-mobile'

const meta = {
  title: 'Form/NSwitch',
  component: NSwitch,
  tags: ['autodocs'],
  argTypes: {
    label: { control: 'text' },
    description: { control: 'text' },
    disabled: { control: 'boolean' },
  },
  args: {
    value: false,
    label: '알림',
    description: '푸시 알림을 받습니다',
  },
} satisfies Meta<typeof NSwitch>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: (args) => {
    const [value, setValue] = useState(args.value)
    return <NSwitch {...args} value={value} onValueChange={setValue} />
  },
}

export const Enabled: Story = {
  render: (args) => {
    const [value, setValue] = useState(true)
    return <NSwitch {...args} value={value} onValueChange={setValue} />
  },
}

export const Disabled: Story = {
  args: { disabled: true, value: true },
}

export const SettingsList: Story = {
  render: () => {
    const [notif, setNotif] = useState(true)
    const [dark, setDark] = useState(false)
    const [sound, setSound] = useState(true)
    return (
      <View style={{ gap: 20 }}>
        <NSwitch value={notif} onValueChange={setNotif} label="알림" description="푸시 알림을 받습니다" />
        <NSwitch value={dark} onValueChange={setDark} label="다크 모드" description="어두운 테마를 사용합니다" />
        <NSwitch value={sound} onValueChange={setSound} label="사운드" description="앱 사운드를 활성화합니다" />
      </View>
    )
  },
}
