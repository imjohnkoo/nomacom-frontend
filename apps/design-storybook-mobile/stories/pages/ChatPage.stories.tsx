import React, { useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { View, TouchableOpacity } from 'react-native'
import {
  NScreen,
  NHeader,
  NText,
  NAvatar,
  NInput,
  NButton,
  NBadge,
  NBottomSheet,
} from '@imjohnkoo/design-mobile'

const messages = [
  { id: '1', sender: 'other', name: '이서연', text: '디자인 시스템 리뷰 가능할까요?', time: '오전 10:30' },
  { id: '2', sender: 'me', text: '네, 오후에 확인하겠습니다!', time: '오전 10:32' },
  { id: '3', sender: 'other', name: '이서연', text: 'Figma 링크 보내드릴게요', time: '오전 10:33' },
  { id: '4', sender: 'other', name: '이서연', text: '컴포넌트 변경사항 정리해두었어요. 특히 Button, Card 쪽 확인 부탁드려요.', time: '오전 10:34' },
  { id: '5', sender: 'me', text: '확인했습니다. Button variant 부분은 수정이 필요할 것 같아요', time: '오전 11:15' },
  { id: '6', sender: 'me', text: '나머지는 LGTM 👍', time: '오전 11:15' },
  { id: '7', sender: 'other', name: '이서연', text: '감사합니다! 수정 후 다시 공유드릴게요', time: '오전 11:20' },
]

function MessageBubble({ msg }: { msg: (typeof messages)[0] }) {
  const isMe = msg.sender === 'me'
  return (
    <View style={{ alignItems: isMe ? 'flex-end' : 'flex-start', marginBottom: 8 }}>
      {!isMe && (
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 4 }}>
          <NAvatar size="sm" text={msg.name?.slice(0, 1) || ''} />
          <NText variant="caption" weight="semibold">{msg.name}</NText>
        </View>
      )}
      <View
        style={{
          backgroundColor: isMe ? '#2563eb' : '#f5f5f5',
          borderRadius: 16,
          borderTopRightRadius: isMe ? 4 : 16,
          borderTopLeftRadius: isMe ? 16 : 4,
          paddingHorizontal: 14,
          paddingVertical: 10,
          maxWidth: '75%',
          marginLeft: isMe ? 0 : 38,
        }}
      >
        <NText variant="bodySmall" color={isMe ? '#fff' : '#171717'}>{msg.text}</NText>
      </View>
      <NText
        variant="caption"
        color="#a3a3a3"
        style={{ marginTop: 2, marginLeft: isMe ? 0 : 38 }}
      >
        {msg.time}
      </NText>
    </View>
  )
}

function ChatPage() {
  const [message, setMessage] = useState('')
  const [showSheet, setShowSheet] = useState(false)

  return (
    <View style={{ flex: 1, backgroundColor: '#fff' }}>
      <NHeader
        title="이서연"
        subtitle="온라인"
        leftIcon={<NText>←</NText>}
        rightIcon={<NText>⋯</NText>}
        onRightPress={() => setShowSheet(true)}
      />

      <NScreen scroll padding>
        {/* Date badge */}
        <View style={{ alignItems: 'center', marginVertical: 12 }}>
          <NBadge label="오늘" color="neutral" variant="subtle" />
        </View>

        {messages.map((msg) => (
          <MessageBubble key={msg.id} msg={msg} />
        ))}

        <View style={{ height: 80 }} />
      </NScreen>

      {/* Input area */}
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          gap: 8,
          paddingHorizontal: 16,
          paddingVertical: 10,
          borderTopWidth: 1,
          borderTopColor: '#e5e5e5',
          backgroundColor: '#fff',
        }}
      >
        <TouchableOpacity>
          <NText style={{ fontSize: 22 }}>+</NText>
        </TouchableOpacity>
        <View style={{ flex: 1 }}>
          <NInput
            placeholder="메시지를 입력하세요"
            value={message}
            onChangeText={setMessage}
          />
        </View>
        <NButton size="sm" onPress={() => setMessage('')}>전송</NButton>
      </View>

      {/* Options sheet */}
      <NBottomSheet
        visible={showSheet}
        onClose={() => setShowSheet(false)}
        title="채팅 옵션"
      >
        <View style={{ gap: 8 }}>
          <NButton variant="ghost" fullWidth onPress={() => setShowSheet(false)}>알림 끄기</NButton>
          <NButton variant="ghost" fullWidth onPress={() => setShowSheet(false)}>대화 검색</NButton>
          <NButton variant="ghost" fullWidth onPress={() => setShowSheet(false)}>미디어 보기</NButton>
          <NButton variant="danger" fullWidth onPress={() => setShowSheet(false)}>채팅방 나가기</NButton>
        </View>
      </NBottomSheet>
    </View>
  )
}

const meta = {
  title: 'Pages/채팅',
  component: ChatPage,
  parameters: {
    padding: false,
  },
} satisfies Meta<typeof ChatPage>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}
