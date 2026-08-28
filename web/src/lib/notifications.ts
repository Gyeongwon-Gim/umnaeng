// 임박 알림 (PRD FR-5).
// 네이티브(Capacitor WebView)에서는 LocalNotifications로 매일 지정 시각 반복 예약(FR-5.2/5.3
// 완전 충족). 브라우저 개발 모드에서는 Web Notification API가 없거나 LocalNotifications를
// 지원하지 않으므로, 탭이 열려있는 동안의 최선형(best-effort) 알림으로 대체한다.

import { Capacitor } from "@capacitor/core";
import { LocalNotifications } from "@capacitor/local-notifications";
import type { FridgeItem } from "./types";
import { imminentCount } from "./store";
import { todayISO } from "./freshness";

const LAST_SHOWN_KEY = "olivefresh.notif.lastShownDate";
const NOTIFICATION_ID = 1;

function noticeBody(count: number): string {
  return count === 1
    ? "오늘 안에 먹어야 할 항목이 1개 있어요."
    : `오늘 안에 먹어야 할 항목이 ${count}개 있어요.`;
}

export async function requestNotificationPermission(): Promise<boolean> {
  if (Capacitor.isNativePlatform()) {
    const { display } = await LocalNotifications.requestPermissions();
    return display === "granted";
  }
  if (!("Notification" in window)) return false;
  if (Notification.permission === "granted") return true;
  if (Notification.permission === "denied") return false;
  const perm = await Notification.requestPermission();
  return perm === "granted";
}

/**
 * 지정 시각에 발송될 임박 알림을 예약한다 (FR-5.2/5.3). 복수 항목이면 1건으로 묶는다.
 * @param hour 발송 시각 (기본 9시)
 */
export function scheduleDailyImminentNotice(
  items: FridgeItem[],
  hour = 9,
  minute = 0,
): () => void {
  if (Capacitor.isNativePlatform()) {
    return scheduleNative(items, hour, minute);
  }
  return scheduleWeb(items, hour, minute);
}

// 네이티브: 기존 예약을 정리하고 매일 반복(repeats)으로 재등록 — 앱이 꺼져 있어도 발송된다.
function scheduleNative(items: FridgeItem[], hour: number, minute: number): () => void {
  let cancelled = false;
  (async () => {
    await LocalNotifications.cancel({ notifications: [{ id: NOTIFICATION_ID }] });
    if (cancelled) return;
    const count = imminentCount(items);
    if (count === 0) return;
    await LocalNotifications.schedule({
      notifications: [
        {
          id: NOTIFICATION_ID,
          title: "엄냉관",
          body: noticeBody(count),
          schedule: { on: { hour, minute }, repeats: true },
          extra: { screen: "list" },
        },
      ],
    });
  })();
  return () => {
    cancelled = true;
  };
}

// 웹(브라우저 개발 모드): 탭이 열려 있는 동안만 유효한 최선형 알림.
function scheduleWeb(items: FridgeItem[], hour: number, minute: number): () => void {
  if (!("Notification" in window) || Notification.permission !== "granted") {
    return () => {};
  }

  const count = imminentCount(items);
  if (count === 0) return () => {};

  const now = new Date();
  const target = new Date(now);
  target.setHours(hour, minute, 0, 0);

  const fire = () => {
    new Notification("엄냉관", { body: noticeBody(count), data: { screen: "list" } });
    localStorage.setItem(LAST_SHOWN_KEY, todayISO());
  };

  const alreadyShownToday = localStorage.getItem(LAST_SHOWN_KEY) === todayISO();

  if (now >= target) {
    if (!alreadyShownToday) fire();
    return () => {};
  }

  const timer = setTimeout(fire, target.getTime() - now.getTime());
  return () => clearTimeout(timer);
}
