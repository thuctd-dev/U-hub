import React, { useState } from 'react';
import {
  CalendarOutlined, SyncOutlined, CheckCircleOutlined,
  MinusCircleOutlined, RightOutlined, UpOutlined, DownOutlined, CloseOutlined, RedoOutlined,
} from '@ant-design/icons';

interface DatePickerMenuProps {
  startDate?: Date;
  dueDate?: Date;
  onChangeStart: (date: Date | undefined) => void;
  onChangeDue: (date: Date | undefined) => void;
  defaultTab?: 'start' | 'due';
}

const WEEK_DAYS = ['Là', 'Vi', 'Bạn', 'Chúng tôi', 'Th', 'Pháp', 'TRÊN'];
const MONTH_NAMES = [
  'Tháng 1','Tháng 2','Tháng 3','Tháng 4','Tháng 5','Tháng 6',
  'Tháng 7','Tháng 8','Tháng 9','Tháng 10','Tháng 11','Tháng 12',
];

function today() {
  const d = new Date(); d.setHours(0,0,0,0); return d;
}
function addDays(d: Date, n: number) {
  const r = new Date(d); r.setDate(r.getDate() + n); return r;
}
function nextWeekday(d: Date, wd: number) {
  const r = new Date(d);
  const diff = (wd - r.getDay() + 7) % 7 || 7;
  r.setDate(r.getDate() + diff); return r;
}
function isSame(a: Date, b: Date) {
  return a.getFullYear()===b.getFullYear() && a.getMonth()===b.getMonth() && a.getDate()===b.getDate();
}
function isInRange(d: Date, start?: Date, end?: Date) {
  if (!start || !end) return false;
  const [s, e] = start <= end ? [start, end] : [end, start];
  return d > s && d < e;
}
function formatTab(d?: Date) {
  if (!d) return null;
  return `${d.getDate()}/${d.getMonth()+1}/${String(d.getFullYear()).slice(2)}`;
}
function formatSub(d: Date) {
  return `Ngày ${d.getDate()} tháng ${d.getMonth()+1}`;
}
function dayName(d: Date) {
  return ['CN','T2','T3','T4','T5','T6','T7'][d.getDay()];
}

const DatePickerMenu: React.FC<DatePickerMenuProps> = ({ startDate, dueDate, onChangeStart, onChangeDue, defaultTab = 'start' }) => {
  const td = today();
  const [activeTab, setActiveTab] = useState<'start'|'due'>(defaultTab);
  const [viewYear, setViewYear] = useState(td.getFullYear());
  const [viewMonth, setViewMonth] = useState(td.getMonth());

  const shortcuts = [
    { label: 'Hôm nay',       sub: dayName(td),                          date: td },
    { label: 'Sau đó',        sub: '19:00',                              date: td },
    { label: 'Ngày mai',      sub: dayName(addDays(td,1)),               date: addDays(td,1) },
    { label: 'Cuối tuần này', sub: 'Thứ 7',                             date: nextWeekday(td,6) },
    { label: 'Tuần tới',      sub: formatSub(nextWeekday(td,1)),         date: nextWeekday(td,1) },
    { label: 'Cuối tuần tới', sub: formatSub(nextWeekday(addDays(td,7),6)), date: nextWeekday(addDays(td,7),6) },
    { label: '2 tuần',        sub: formatSub(addDays(td,14)),            date: addDays(td,14) },
    { label: '4 tuần',        sub: formatSub(addDays(td,28)),            date: addDays(td,28) },
  ];

  const prevMonth = () => {
    if (viewMonth===0) { setViewMonth(11); setViewYear(y=>y-1); }
    else setViewMonth(m=>m-1);
  };
  const nextMonth = () => {
    if (viewMonth===11) { setViewMonth(0); setViewYear(y=>y+1); }
    else setViewMonth(m=>m+1);
  };

  const handleDayClick = (day: number) => {
    const date = new Date(viewYear, viewMonth, day);
    if (activeTab === 'start') onChangeStart(date);
    else onChangeDue(date);
  };

  const handleShortcut = (date: Date) => {
    if (activeTab === 'start') onChangeStart(date);
    else onChangeDue(date);
  };

  // Build calendar cells
  const daysInMonth = new Date(viewYear, viewMonth+1, 0).getDate();
  const firstDay = new Date(viewYear, viewMonth, 1).getDay();
  const prevDays = new Date(viewYear, viewMonth, 0).getDate();
  const cells: { day: number; cur: boolean }[] = [];
  for (let i = firstDay-1; i >= 0; i--) cells.push({ day: prevDays-i, cur: false });
  for (let d = 1; d <= daysInMonth; d++) cells.push({ day: d, cur: true });
  while (cells.length % 7 !== 0) cells.push({ day: cells.length - daysInMonth - firstDay + 2, cur: false });

  const activeDate = activeTab === 'start' ? startDate : dueDate;

  return (
    <div className="dp-menu backdrop-blur-lg">
      {/* Tabs */}
      <div className="dp-tabs">
        <button
          className={`dp-tab ${activeTab==='start' ? 'active' : ''}`}
          onClick={() => setActiveTab('start')}
        >
          <CalendarOutlined className="dp-tab-cal-icon" />
          {startDate ? (
            <>
              <span className="dp-tab-date">{formatTab(startDate)}</span>
              <CloseOutlined className="dp-tab-clear" onClick={(e) => { e.stopPropagation(); onChangeStart(undefined); }} />
            </>
          ) : (
            <span className="dp-tab-placeholder">Ngày bắt đầu</span>
          )}
        </button>
        <button
          className={`dp-tab ${activeTab==='due' ? 'active' : ''}`}
          onClick={() => setActiveTab('due')}
        >
          <CalendarOutlined className="dp-tab-cal-icon" />
          {dueDate ? (
            <>
              <span className="dp-tab-date">{formatTab(dueDate)}</span>
              <CloseOutlined className="dp-tab-clear" onClick={(e) => { e.stopPropagation(); onChangeDue(undefined); }} />
            </>
          ) : (
            <span className="dp-tab-placeholder">Ngày kết thúc</span>
          )}
        </button>
      </div>

      <div className="dp-body">
        {/* Shortcuts */}
        <div className="dp-shortcuts">
          {shortcuts.map((s) => (
            <button
              key={s.label}
              className={`dp-shortcut ${activeDate && isSame(activeDate, s.date) ? 'active' : ''}`}
              onClick={() => handleShortcut(s.date)}
            >
              <span className="dp-shortcut-label">{s.label}</span>
              <span className="dp-shortcut-sub">{s.sub}</span>
            </button>
          ))}
          <button className="dp-shortcut dp-shortcut-repeat">
            <span className="dp-shortcut-label">Đặt lặp lại</span>
            <RightOutlined className="dp-shortcut-arrow" />
          </button>
        </div>

        {/* Calendar */}
        <div className="dp-calendar">
          <div className="dp-cal-header">
            <span className="dp-cal-title">{MONTH_NAMES[viewMonth]} năm {viewYear}</span>
            <button className="dp-cal-today" onClick={() => { setViewMonth(td.getMonth()); setViewYear(td.getFullYear()); }}>
              Hôm nay
            </button>
            <button className="dp-cal-nav" onClick={prevMonth}><UpOutlined /></button>
            <button className="dp-cal-nav" onClick={nextMonth}><DownOutlined /></button>
          </div>

          <div className="dp-cal-grid">
            {WEEK_DAYS.map((d) => (
              <div key={d} className="dp-cal-day-name">{d}</div>
            ))}
            {cells.map((cell, i) => {
              const cellDate = new Date(viewYear, viewMonth, cell.day);
              const isToday   = cell.cur && isSame(cellDate, td);
              const isStart   = cell.cur && startDate && isSame(cellDate, startDate);
              const isDue     = cell.cur && dueDate   && isSame(cellDate, dueDate);
              const inRange   = cell.cur && isInRange(cellDate, startDate, dueDate);
              const isActive  = activeTab==='start' ? isStart : isDue;

              return (
                <button
                  key={i}
                  disabled={!cell.cur}
                  className={[
                    'dp-cal-day',
                    !cell.cur  ? 'other-month' : '',
                    isToday    ? 'today'        : '',
                    isStart    ? 'range-start'  : '',
                    isDue      ? 'range-end'    : '',
                    inRange    ? 'in-range'     : '',
                    isActive   ? 'selected'     : '',
                  ].filter(Boolean).join(' ')}
                  onClick={() => cell.cur && handleDayClick(cell.day)}
                >
                  {cell.day}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DatePickerMenu;
