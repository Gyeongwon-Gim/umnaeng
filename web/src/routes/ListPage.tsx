// 리스트 뷰 — 우선순위 큐 정렬 + 냉장/냉동 필터 + Undo 스낵바 (PRD FR-3/6)

import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore, sortItems } from '../lib/store';
import { remainingDays } from '../lib/freshness';
import { ItemRow } from '../components/ItemRow';
import { Icon } from '../components/Icon';
import {
  requestNotificationPermission,
  scheduleDailyImminentNotice,
} from '../lib/notifications';
import type { FridgeItem, StorageLocation } from '../lib/types';
import {
  Container,
  CountBadge,
  CountText,
  Empty,
  EmptyBigText,
  EmptyDesc,
  EmptyTitle,
  Fab,
  FabPlus,
  FilterBar,
  SectionHeader,
  SegmentThumb,
  SegmentTrack,
  Snackbar,
  SnackAction,
  SnackText,
  Tab,
  TabText,
} from './ListPage.styles';

type Filter = StorageLocation;

export default function ListPage() {
  const { items, consume, moveToFreezer } = useStore();
  const navigate = useNavigate();
  const [filter, setFilter] = useState<Filter>('fridge');
  const [undo, setUndo] = useState<{
    label: string;
    restore: () => void;
  } | null>(null);

  // 앱 진입 시 알림 권한 + 임박 알림 재예약 (FR-5)
  useEffect(() => {
    let cancel = () => {};
    (async () => {
      const ok = await requestNotificationPermission();
      if (ok) cancel = scheduleDailyImminentNotice(items);
    })();
    return () => cancel();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [items]);

  const filtered = useMemo(
    () => items.filter((it) => it.location === filter),
    [items, filter],
  );

  // 위치별 전체 재고 수 (만료 여부 무관, 필터 버튼 표시용)
  const locationCounts = useMemo(() => {
    const counts: Record<StorageLocation, number> = { fridge: 0, freezer: 0, kimchi: 0 };
    for (const it of items) counts[it.location]++;
    return counts;
  }, [items]);

  // 만료 섹션 분리 (FR-3.4)
  const sections = useMemo(() => {
    const sorted = sortItems(filtered);
    const expired = sorted.filter((it) => remainingDays(it) < 0);
    const active = sorted.filter((it) => remainingDays(it) >= 0);
    const out: { title: string; data: FridgeItem[] }[] = [];
    if (expired.length)
      out.push({ title: `만료 · ${expired.length}`, data: expired });
    if (active.length) out.push({ title: '', data: active });
    return out;
  }, [filtered]);

  const handleConsume = (id: string) => {
    const restore = consume(id);
    if (restore) {
      setUndo({ label: '소진 처리됨', restore });
      setTimeout(
        () => setUndo((u) => (u?.restore === restore ? null : u)),
        5000,
      ); // 5초 (FR-6.2)
    }
  };

  return (
    <Container>
      <FilterBarView
        filter={filter}
        onChange={setFilter}
        counts={locationCounts}
      />

      {sections.length === 0 ? (
        <EmptyView />
      ) : (
        sections.map((section) => (
          <div key={section.title || 'active'}>
            {section.title && <SectionHeader>{section.title}</SectionHeader>}
            {section.data.map((item) => (
              <ItemRow
                key={item.id}
                item={item}
                onConsume={handleConsume}
                onFreeze={moveToFreezer}
                onPress={(id) => navigate(`/edit/${id}`)}
              />
            ))}
          </div>
        ))
      )}

      {/* Undo 스낵바 (FR-6.2) */}
      {undo && (
        <Snackbar>
          <SnackText>{undo.label}</SnackText>
          <SnackAction
            onClick={() => {
              undo.restore();
              setUndo(null);
            }}
          >
            실행 취소
          </SnackAction>
        </Snackbar>
      )}

      {/* 등록 FAB */}
      <Fab onClick={() => navigate('/add')}>
        <FabPlus>
          <Icon $size={32}>add</Icon>
        </FabPlus>
      </Fab>
    </Container>
  );
}

function FilterBarView({
  filter,
  onChange,
  counts,
}: {
  filter: Filter;
  onChange: (f: Filter) => void;
  counts: Record<Filter, number>;
}) {
  const tabs: { key: Filter; label: string; count: number }[] = [
    { key: 'fridge', label: '냉장', count: counts.fridge },
    { key: 'freezer', label: '냉동', count: counts.freezer },
    { key: 'kimchi', label: '김치냉장고', count: counts.kimchi },
  ];
  const activeIndex = tabs.findIndex((t) => t.key === filter);
  return (
    <FilterBar>
      <SegmentTrack>
        <SegmentThumb $index={activeIndex} $count={tabs.length} />
        {tabs.map((t) => {
          const active = filter === t.key;
          return (
            <Tab key={t.key} $active={active} onClick={() => onChange(t.key)}>
              <TabText $active={active}>{t.label}</TabText>
              <CountBadge>
                <CountText>{t.count}</CountText>
              </CountBadge>
            </Tab>
          );
        })}
      </SegmentTrack>
    </FilterBar>
  );
}

function EmptyView() {
  return (
    <Empty>
      <EmptyBigText>텅</EmptyBigText>
      <EmptyTitle>냉장고가 비어 있어요</EmptyTitle>
      <EmptyDesc>
        <Icon $size={16}>add</Icon> 버튼을 눌러 식재료를 등록해보세요
      </EmptyDesc>
    </Empty>
  );
}
