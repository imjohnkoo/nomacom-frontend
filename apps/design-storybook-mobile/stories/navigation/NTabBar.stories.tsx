import React, { useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { Text } from 'react-native'
import { NTabBar } from '@imjohnkoo/design-mobile'

const sampleItems = [
  { key: 'home', label: '홈', icon: <Text style={{ fontSize: 20 }}>🏠</Text> },
  { key: 'search', label: '검색', icon: <Text style={{ fontSize: 20 }}>🔍</Text> },
  { key: 'notifications', label: '알림', icon: <Text style={{ fontSize: 20 }}>🔔</Text>, badge: 5 },
  { key: 'profile', label: '프로필', icon: <Text style={{ fontSize: 20 }}>👤</Text> },
]

const meta = {
  title: 'Navigation/NTabBar',
  component: NTabBar,
  tags: ['autodocs'],
  args: { items: sampleItems, activeKey: 'home' },
} satisfies Meta<typeof NTabBar>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: (args) => {
    const [activeKey, setActiveKey] = useState(args.activeKey)
    return <NTabBar {...args} activeKey={activeKey} onSelect={setActiveKey} />
  },
}

export const WithBadge: Story = {
  render: (args) => {
    const [activeKey, setActiveKey] = useState('notifications')
    return <NTabBar {...args} activeKey={activeKey} onSelect={setActiveKey} />
  },
}

export const ThreeTabs: Story = {
  render: () => {
    const [activeKey, setActiveKey] = useState('feed')
    const items = [
      { key: 'feed', label: '피드', icon: <Text style={{ fontSize: 20 }}>📰</Text> },
      { key: 'explore', label: '탐색', icon: <Text style={{ fontSize: 20 }}>🧭</Text> },
      { key: 'settings', label: '설정', icon: <Text style={{ fontSize: 20 }}>⚙️</Text> },
    ]
    return <NTabBar items={items} activeKey={activeKey} onSelect={setActiveKey} />
  },
}
