import { describe, it, expect } from 'vitest';
import { normalizePhoneNumber, normalizeName, matchesOrderContact } from './verification';

describe('normalizePhoneNumber', () => {
  it('하이픈 포맷 (클라이언트 formatter) 을 숫자만으로 정규화한다', () => {
    expect(normalizePhoneNumber('010-1234-5678')).toBe('01012345678');
  });

  it('하이픈 없는 형식은 그대로 유지한다', () => {
    expect(normalizePhoneNumber('01012345678')).toBe('01012345678');
  });

  it('공백/괄호 등 비숫자 문자를 모두 제거한다', () => {
    expect(normalizePhoneNumber(' 010 1234 5678 ')).toBe('01012345678');
    expect(normalizePhoneNumber('+82 (10) 1234-5678')).toBe('821012345678');
  });

  it('null/undefined 는 빈 문자열로 처리한다', () => {
    expect(normalizePhoneNumber(null)).toBe('');
    expect(normalizePhoneNumber(undefined)).toBe('');
  });
});

describe('normalizeName', () => {
  it('앞뒤/중간 공백을 제거한다', () => {
    expect(normalizeName('  홍 길동 ')).toBe('홍길동');
  });

  it('NFC 정규화로 자모 분해 입력 (macOS) 을 통일한다', () => {
    const decomposed = '홍길동'.normalize('NFD');
    expect(normalizeName(decomposed)).toBe('홍길동');
  });

  it('영문 이름은 대소문자 무시 비교가 가능하게 소문자화한다', () => {
    expect(normalizeName('John Doe')).toBe('johndoe');
  });

  it('null/undefined 는 빈 문자열로 처리한다', () => {
    expect(normalizeName(null)).toBe('');
    expect(normalizeName(undefined)).toBe('');
  });
});

describe('matchesOrderContact (군간 AND + 군내 OR)', () => {
  // 선물 주문 시나리오: 구매자 김철수 가 수령인 홍길동 에게 선물
  const giftOrder = {
    customerName: '김철수',
    customerPhoneNumber: '010-9999-0000',
    receiverName: '홍길동',
    receiverPhoneNumber: '010-1234-5678',
  };

  it('수령인 이름 + 수령인 전화로 통과', () => {
    expect(
      matchesOrderContact({ fullName: '홍길동', phoneNumber: '010-1234-5678' }, giftOrder),
    ).toBe(true);
  });

  it('구매자 이름 + 구매자 전화로 통과 (선물 주문 CS 케이스)', () => {
    expect(
      matchesOrderContact({ fullName: '김철수', phoneNumber: '010-9999-0000' }, giftOrder),
    ).toBe(true);
  });

  it('크로스 조합 (수령인 이름 + 구매자 전화) 도 통과 — 군내 OR', () => {
    expect(
      matchesOrderContact({ fullName: '홍길동', phoneNumber: '010-9999-0000' }, giftOrder),
    ).toBe(true);
  });

  it('이름만 맞고 전화가 4값 모두와 불일치하면 거부 — 군간 AND', () => {
    expect(
      matchesOrderContact({ fullName: '홍길동', phoneNumber: '010-0000-0000' }, giftOrder),
    ).toBe(false);
  });

  it('전화만 맞고 이름이 불일치하면 거부 — 군간 AND', () => {
    expect(
      matchesOrderContact({ fullName: '아무개', phoneNumber: '010-1234-5678' }, giftOrder),
    ).toBe(false);
  });

  it('DB 가 하이픈 없이 저장돼 있어도 하이픈 입력과 일치한다', () => {
    expect(
      matchesOrderContact(
        { fullName: '홍길동', phoneNumber: '010-1234-5678' },
        { ...giftOrder, receiverPhoneNumber: '01012345678' },
      ),
    ).toBe(true);
  });

  it('이름 공백 차이는 무시한다', () => {
    expect(
      matchesOrderContact({ fullName: ' 홍 길동 ', phoneNumber: '01012345678' }, giftOrder),
    ).toBe(true);
  });

  it('구매자 정보가 없는 주문 (수령인만) 도 수령인 값으로 통과', () => {
    const receiverOnly = {
      customerName: null,
      customerPhoneNumber: null,
      receiverName: '홍길동',
      receiverPhoneNumber: '010-1234-5678',
    };
    expect(
      matchesOrderContact({ fullName: '홍길동', phoneNumber: '01012345678' }, receiverOnly),
    ).toBe(true);
  });

  it('연락처 4값이 전부 null 이면 어떤 입력도 통과하지 못한다 (fail-closed)', () => {
    const emptyOrder = {
      customerName: null,
      customerPhoneNumber: null,
      receiverName: null,
      receiverPhoneNumber: null,
    };
    expect(matchesOrderContact({ fullName: '홍길동', phoneNumber: '01012345678' }, emptyOrder)).toBe(
      false,
    );
    expect(matchesOrderContact({ fullName: '', phoneNumber: '' }, emptyOrder)).toBe(false);
  });

  it('빈 입력은 빈 DB 값과도 일치하지 않는다', () => {
    expect(
      matchesOrderContact(
        { fullName: '', phoneNumber: '' },
        { customerName: '', customerPhoneNumber: '', receiverName: '', receiverPhoneNumber: '' },
      ),
    ).toBe(false);
  });
});
