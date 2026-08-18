import { describe, it, expect } from 'vitest';
import { normalizePhoneNumber, normalizeName, matchesReceiver } from './verification';

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

describe('matchesReceiver', () => {
  const receiver = { receiverName: '홍길동', receiverPhoneNumber: '010-1234-5678' };

  it('이름 + 전화번호가 모두 일치하면 true', () => {
    expect(
      matchesReceiver({ fullName: '홍길동', phoneNumber: '010-1234-5678' }, receiver),
    ).toBe(true);
  });

  it('DB 가 하이픈 없이 저장돼 있어도 클라이언트 하이픈 입력과 일치한다', () => {
    expect(
      matchesReceiver(
        { fullName: '홍길동', phoneNumber: '010-1234-5678' },
        { receiverName: '홍길동', receiverPhoneNumber: '01012345678' },
      ),
    ).toBe(true);
  });

  it('이름 공백 차이는 무시한다', () => {
    expect(
      matchesReceiver({ fullName: ' 홍 길동 ', phoneNumber: '01012345678' }, receiver),
    ).toBe(true);
  });

  it('이름 불일치면 false', () => {
    expect(
      matchesReceiver({ fullName: '김철수', phoneNumber: '010-1234-5678' }, receiver),
    ).toBe(false);
  });

  it('전화번호 불일치면 false', () => {
    expect(
      matchesReceiver({ fullName: '홍길동', phoneNumber: '010-9999-5678' }, receiver),
    ).toBe(false);
  });

  it('둘 중 하나만 맞으면 false (AND 조건)', () => {
    expect(
      matchesReceiver({ fullName: '홍길동', phoneNumber: '010-0000-0000' }, receiver),
    ).toBe(false);
    expect(matchesReceiver({ fullName: '아무개', phoneNumber: '01012345678' }, receiver)).toBe(
      false,
    );
  });

  it('DB 수취인 정보가 null 이면 어떤 입력도 통과하지 못한다 (fail-closed)', () => {
    const emptyReceiver = { receiverName: null, receiverPhoneNumber: null };
    expect(matchesReceiver({ fullName: '홍길동', phoneNumber: '01012345678' }, emptyReceiver)).toBe(
      false,
    );
    expect(matchesReceiver({ fullName: '', phoneNumber: '' }, emptyReceiver)).toBe(false);
  });

  it('빈 입력은 빈 DB 값과도 일치하지 않는다', () => {
    expect(
      matchesReceiver(
        { fullName: '', phoneNumber: '' },
        { receiverName: '', receiverPhoneNumber: '' },
      ),
    ).toBe(false);
  });
});
