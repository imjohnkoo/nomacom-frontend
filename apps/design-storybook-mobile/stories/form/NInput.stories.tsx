import React from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { View } from 'react-native'
import { NInput } from '@imjohnkoo/design-mobile'

const meta = {
  title: 'Form/NInput',
  component: NInput,
  tags: ['autodocs'],
  argTypes: {
    label: { control: 'text' },
    placeholder: { control: 'text' },
    hint: { control: 'text' },
    error: { control: 'text' },
    disabled: { control: 'boolean' },
  },
  args: {
    label: '이메일',
    placeholder: '이메일을 입력하세요',
  },
} satisfies Meta<typeof NInput>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}
export const WithHint: Story = { args: { hint: '회사 이메일을 사용해주세요' } }
export const WithError: Story = { args: { error: '유효하지 않은 이메일 주소입니다' } }
export const Disabled: Story = { args: { disabled: true, value: 'disabled@example.com' } }

export const FormExample: Story = {
  render: () => (
    <View style={{ gap: 16 }}>
      <NInput label="이름" placeholder="이름을 입력하세요" />
      <NInput label="이메일" placeholder="이메일을 입력하세요" hint="회사 이메일 권장" />
      <NInput label="비밀번호" placeholder="비밀번호" secureTextEntry />
    </View>
  ),
}
