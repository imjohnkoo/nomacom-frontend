import React, { useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { View, TouchableOpacity } from 'react-native'
import {
  NScreen,
  NHeader,
  NText,
  NAvatar,
  NBadge,
  NCard,
  NDivider,
  NTabBar,
  NSkeleton,
} from '@imjohnkoo/design-mobile'

const feedData = [
  {
    id: '1',
    user: { name: '이서연', avatar: 'SY', time: '3분 전' },
    content: '새로운 디자인 시스템 가이드라인을 업데이트했습니다. 피드백 부탁드려요!',
    likes: 24,
    comments: 8,
    badge: '공지',
  },
  {
    id: '2',
    user: { name: '박준혁', avatar: 'JH', time: '15분 전' },
    content: 'v2.0 릴리즈 준비 완료! QA 팀에서 최종 검토 중입니다.',
    likes: 42,
    comments: 15,
  },
  {
    id: '3',
    user: { name: '최예진', avatar: 'YJ', time: '1시간 전' },
    content: '이번 스프린트 회고 미팅 일정이 변경되었습니다. 내일 오후 3시로 확인해주세요.',
    likes: 11,
    comments: 3,
  },
  {
    id: '4',
    user: { name: '정도현', avatar: 'DH', time: '2시간 전' },
    content: '모바일 앱 성능 최적화 작업 완료. 로딩 시간 40% 단축!',
    likes: 67,
    comments: 22,
    badge: '성과',
  },
]

function FeedCard({ item }: { item: (typeof feedData)[0] }) {
  return (
    <NCard variant="outlined" padding="md">
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 12 }}>
        <NAvatar size="sm" text={item.user.avatar} />
        <View style={{ flex: 1 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
            <NText variant="label">{item.user.name}</NText>
            {item.badge && <NBadge label={item.badge} color="primary" size="sm" />}
          </View>
          <NText variant="caption" color="#a3a3a3">{item.user.time}</NText>
        </View>
      </View>

      <NText variant="body">{item.content}</NText>

      <NDivider spacing={12} />

      <View style={{ flexDirection: 'row', gap: 20 }}>
        <NText variant="caption" color="#737373">❤️ {item.likes}</NText>
        <NText variant="caption" color="#737373">💬 {item.comments}</NText>
        <NText variant="caption" color="#737373">↗️ 공유</NText>
      </View>
    </NCard>
  )
}

function FeedPage() {
  const [activeTab, setActiveTab] = useState('feed')

  return (
    <View style={{ flex: 1, backgroundColor: '#fafafa' }}>
      <NHeader
        title="피드"
        rightIcon={<NText>🔔</NText>}
      />

      <NScreen scroll padding>
        <View style={{ gap: 12 }}>
          {feedData.map((item) => (
            <FeedCard key={item.id} item={item} />
          ))}
        </View>
        <View style={{ height: 80 }} />
      </NScreen>

      <NTabBar
        items={[
          { key: 'feed', label: '피드', icon: <NText>📰</NText> },
          { key: 'search', label: '검색', icon: <NText>🔍</NText> },
          { key: 'notifications', label: '알림', icon: <NText>🔔</NText>, badge: 3 },
          { key: 'profile', label: '프로필', icon: <NText>👤</NText> },
        ]}
        activeKey={activeTab}
        onSelect={setActiveTab}
      />
    </View>
  )
}

const meta = {
  title: 'Pages/피드',
  component: FeedPage,
  parameters: {
    padding: false,
  },
} satisfies Meta<typeof FeedPage>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}

export const LoadingState: Story = {
  render: () => (
    <View style={{ flex: 1, backgroundColor: '#fafafa' }}>
      <NHeader title="피드" rightIcon={<NText>🔔</NText>} />
      <NScreen scroll padding>
        <View style={{ gap: 12 }}>
          {Array.from({ length: 3 }, (_, i) => (
            <NCard key={i} variant="outlined" padding="md">
              <View style={{ flexDirection: 'row', gap: 10, marginBottom: 12 }}>
                <NSkeleton circle width={32} height={32} />
                <View style={{ flex: 1, gap: 6 }}>
                  <NSkeleton height={14} width="40%" />
                  <NSkeleton height={10} width="25%" />
                </View>
              </View>
              <View style={{ gap: 6 }}>
                <NSkeleton height={14} />
                <NSkeleton height={14} width="85%" />
              </View>
            </NCard>
          ))}
        </View>
      </NScreen>
    </View>
  ),
}
