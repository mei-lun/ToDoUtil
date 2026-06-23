import { useState } from 'react'
import { todayStr, addDays } from '../utils/date-utils'

interface Props {
  initial?: string
  onPick: (date: string) => void
  onCancel: () => void
}

export function DatePickerPopover({ initial, onPick, onCancel }: Props) {
  const [value, setValue] = useState(initial ?? todayStr())
  return (
    <div className="popover-mask" onClick={onCancel}>
      <div className="popover" onClick={(e) => e.stopPropagation()}>
        <div className="popover-title">选择日期</div>
        <input
          type="date"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          className="popover-date"
        />
        <div className="popover-shortcuts">
          <button onClick={() => setValue(todayStr())}>今天</button>
          <button onClick={() => setValue(addDays(todayStr(), 1))}>明天</button>
          <button onClick={() => setValue(addDays(todayStr(), 7))}>下周</button>
        </div>
        <div className="popover-actions">
          <button onClick={onCancel}>取消</button>
          <button className="primary" onClick={() => onPick(value)}>确认</button>
        </div>
      </div>
    </div>
  )
}
