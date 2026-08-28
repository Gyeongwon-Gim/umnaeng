import styled, { keyframes } from "styled-components";

export const Container = styled.div`
  min-height: 100%;
  background: #fafafa;
  padding-bottom: 120px;
`;

export const FilterBar = styled.div`
  padding: 12px;
  background: #fff;
  position: sticky;
  top: 0;
  z-index: 1;
`;

/** iOS 스타일 세그먼트 컨트롤 트랙 */
export const SegmentTrack = styled.div`
  position: relative;
  display: flex;
  background: #f1f8e9;
  border-radius: 12px;
  padding: 3px;
`;

/** 선택된 세그먼트를 따라 부드럽게 슬라이드하는 흰색 인디케이터 */
export const SegmentThumb = styled.div<{ $index: number; $count: number }>`
  position: absolute;
  top: 3px;
  bottom: 3px;
  left: calc(3px + (100% - 6px) * ${(p) => p.$index} / ${(p) => p.$count});
  width: calc((100% - 6px) / ${(p) => p.$count});
  border-radius: 9px;
  background: #fff;
  transition: left 0.25s cubic-bezier(0.4, 0, 0.2, 1);
`;

export const Tab = styled.button<{ $active: boolean }>`
  position: relative;
  z-index: 1;
  flex: 1;
  min-width: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 5px;
  padding: 8px 4px;
  border-radius: 9px;
`;

export const TabText = styled.span<{ $active: boolean }>`
  color: ${(p) => (p.$active ? "#2e7d32" : "#7a8b7a")};
  font-weight: ${(p) => (p.$active ? 700 : 600)};
  font-size: 13px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

export const CountBadge = styled.span`
  min-width: 18px;
  height: 18px;
  flex-shrink: 0;
  border-radius: 9px;
  padding: 0 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #e8f5e9;
`;

export const CountText = styled.span`
  font-size: 11px;
  font-weight: 700;
  color: #2e7d32;
`;

export const SectionHeader = styled.div`
  padding: 6px 16px;
  background: #fafafa;
  color: #9e9e9e;
  font-size: 12px;
  font-weight: 700;
`;

export const Empty = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px;
  min-height: 60vh;
  text-align: center;
`;

export const EmptyBigText = styled.div`
  font-size: 96px;
  font-weight: 900;
  color: #c8e6c9;
  line-height: 1;
  margin-bottom: 12px;
`;

export const EmptyTitle = styled.div`
  font-size: 18px;
  font-weight: 700;
  color: #424242;
`;

export const EmptyDesc = styled.div`
  font-size: 14px;
  color: #9e9e9e;
  margin-top: 6px;
`;

const slideUp = keyframes`
  from {
    transform: translateY(24px);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
`;

export const Snackbar = styled.div`
  position: fixed;
  left: 16px;
  right: 16px;
  bottom: calc(88px + env(safe-area-inset-bottom));
  max-width: 480px;
  margin: 0 auto;
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: #323232;
  border-radius: 10px;
  padding: 12px 16px;
  z-index: 2;
  animation: ${slideUp} 0.25s cubic-bezier(0.4, 0, 0.2, 1);
`;

export const SnackText = styled.span`
  color: #fff;
  font-size: 14px;
`;

export const SnackAction = styled.button`
  color: #81c784;
  font-weight: 700;
  font-size: 14px;
`;

export const Fab = styled.button`
  position: fixed;
  right: 20px;
  bottom: calc(20px + env(safe-area-inset-bottom));
  width: 60px;
  height: 60px;
  border-radius: 30px;
  background: #2e7d32;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 3px 6px rgba(0, 0, 0, 0.25);
  z-index: 2;
`;

export const FabPlus = styled.span`
  color: #fff;
  font-size: 32px;
  line-height: 36px;
  font-weight: 300;
`;
