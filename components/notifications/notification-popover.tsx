"use client"

import { useState, useEffect, useRef } from "react"
import Draggable from "react-draggable"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Bell, Info, AlertTriangle, XCircle, CheckCircle, Trash2, GripVertical, X } from "lucide-react"
import { Separator } from "@/components/ui/separator"
import Link from "next/link"
import { useNotifications } from "@/hooks/use-notifications"
import { cn } from "@/components/utils" // cn 유틸리티를 가져옵니다.

interface DraggableData {
  x: number;
  y: number;
}

export default function NotificationPopover() {
  const { notifications, unreadCount, markAsRead, deleteNotification } = useNotifications()
  const [isOpen, setIsOpen] = useState(false)
  const nodeRef = useRef(null)

  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [hasLoadedPosition, setHasLoadedPosition] = useState(false);

  // Load position from localStorage
  useEffect(() => {
    const savedPosition = localStorage.getItem("notification-window-position")
    if (savedPosition) {
      const parsedPosition = JSON.parse(savedPosition);
      // Ensure position is within viewport bounds on load
      parsedPosition.x = Math.min(Math.max(parsedPosition.x, -window.innerWidth + 200), 0);
      parsedPosition.y = Math.min(Math.max(parsedPosition.y, -window.innerHeight + 200), 0);
      setPosition(parsedPosition);
    }
    setHasLoadedPosition(true);
  }, [])

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleDrag = (e: any, data: DraggableData) => {
    setPosition({ x: data.x, y: data.y });
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleStop = (e: any, data: DraggableData) => {
    localStorage.setItem("notification-window-position", JSON.stringify({ x: data.x, y: data.y }))
  }

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "info":
        return <Info className="w-5 h-5 text-blue-500" />
      case "warning":
        return <AlertTriangle className="w-5 h-5 text-yellow-500" />
      case "error":
        return <XCircle className="w-5 h-5 text-red-500" />
      case "success":
        return <CheckCircle className="w-5 h-5 text-green-500" />
      default:
        return <Bell className="w-5 h-5 text-gray-500" />
    }
  }

  // Render nothing until position is loaded to prevent flash of un-positioned element
  if (!hasLoadedPosition) {
    return null; 
  }

  return (
    <>
      {/* Notification Bell Icon - Stays in the corner */}
      <Button
        variant="outline"
        size="icon"
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 w-9 h-9 rounded-full shadow-lg bg-white hover:bg-gray-100 z-50"
      >
        <Bell className="h-3.5 w-3.5 text-gray-700" />
        {unreadCount > 0 && (
          <Badge className="absolute -top-1 -right-1 bg-red-500 text-white px-1.5 py-0 text-[10px] rounded-full">
            {unreadCount}
          </Badge>
        )}
      </Button>

      {/* Draggable Notification Window */}
      {isOpen && (
        <Draggable
          nodeRef={nodeRef}
          handle=".drag-handle"
          position={position}
          onDrag={handleDrag}
          onStop={handleStop}
          bounds="body"
        >
          <div
            ref={nodeRef}
            className="fixed bottom-24 right-6 w-96 bg-white rounded-lg shadow-2xl border border-gray-200 z-50"
          >
            <div
              className="drag-handle cursor-move p-3 flex items-center justify-between bg-gray-100 rounded-t-lg border-b"
            >
              <div className="flex items-center gap-2">
                <GripVertical className="w-5 h-5 text-gray-500" />
                <h4 className="text-base font-semibold">알림</h4>
              </div>
              <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setIsOpen(false)}>
                <X className="w-4 h-4" />
              </Button>
            </div>
            <div className="p-4">
              <div className="max-h-80 overflow-y-auto pr-2 -mr-4">
                {notifications.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <Bell className="w-10 h-10 mx-auto mb-2 text-gray-300" />
                    <p>새로운 알림이 없습니다.</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {notifications.map((notification) => (
                      <div
                        key={notification.id}
                        className={cn("p-3 rounded-lg transition-all", !notification.read ? "bg-blue-50" : "bg-white")}
                      >
                        <div className="flex items-start gap-3">
                          <div className="mt-1">{getNotificationIcon(notification.type)}</div>
                          <div className="flex-1 min-w-0">
                            <p className={cn("font-medium text-sm", !notification.read ? "text-gray-900" : "text-gray-700")}>
                              {notification.title}
                            </p>
                            <p className="text-xs text-gray-500 mt-1">{notification.message}</p>
                          </div>
                          <div className="flex items-center gap-1">
                            {!notification.read && (
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-7 w-7 rounded-full"
                                onClick={() => markAsRead(notification.id)}
                                title="읽음으로 표시"
                              >
                                <CheckCircle className="w-4 h-4 text-green-600" />
                              </Button>
                            )}
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7 rounded-full"
                              onClick={() => deleteNotification(notification.id)}
                              title="알림 삭제"
                            >
                              <Trash2 className="w-4 h-4 text-red-600" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <Separator className="my-3" />
              <Button variant="ghost" className="w-full" asChild>
                <Link href="/notifications" onClick={() => setIsOpen(false)}>
                  모든 알림 보기
                </Link>
              </Button>
            </div>
          </div>
        </Draggable>
      )}
    </>
  )
}
