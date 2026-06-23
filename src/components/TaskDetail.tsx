import { MarkdownView } from './MarkdownView'
import { MarkdownEditor } from './MarkdownEditor'
import { useTasksStore } from '../store/tasks-store'
import { useViewStore } from '../store/view-store'
import type { Task } from '../types'

export function TaskDetail({ task }: { task: Task }) {
  const upsert = useTasksStore(s => s.upsert)
  const editing = useViewStore(s => s.editingTaskId) === task.id
  const setEditing = useViewStore(s => s.setEditing)

  async function saveDetail(next: string) {
    await upsert({ ...task, detail: next })
    setEditing(null)
  }

  return (
    <div className="task-detail" onClick={(e) => e.stopPropagation()}>
      {editing ? (
        <MarkdownEditor
          initial={task.detail}
          onSave={saveDetail}
          onCancel={() => setEditing(null)}
        />
      ) : (
        <>
          <MarkdownView
            source={task.detail}
            onChange={(next) => upsert({ ...task, detail: next })}
          />
          {!task.detail && <div className="empty-detail">（无内容）</div>}
        </>
      )}
    </div>
  )
}
