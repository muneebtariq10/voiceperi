import { BellRing, Check, Bell } from "lucide-react"
import { useEffect, useState } from "react"
import axios from "axios"
import { jwtDecode } from "jwt-decode"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"

type CardProps = React.ComponentProps<typeof Card>

interface DecodedToken {
  sub?: string;
}

export function Notification({ className, ...props }: CardProps) {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchNotifications = async () => {
      const token = sessionStorage.getItem("authToken") || localStorage.getItem("authToken");
      if (!token) return;

      try {
        const decoded: DecodedToken = jwtDecode(token);
        if (!decoded.sub) return;

        const response = await axios.get(`${import.meta.env.VITE_API_BASE_URL}api/call-history`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });

        if (Array.isArray(response.data)) {
          const recentCalls = response.data
            .sort((a, b) => new Date(b.time || 0).getTime() - new Date(a.time || 0).getTime())
            .slice(0, 3)
            .map(call => ({
              title: call.success ? "Successful Call Completed" : "Missed or Failed Call",
              description: `Duration: ${call.duration || "0:00"} - ${call.time || "Recently"}`,
              isUnread: true
            }));
          setNotifications(recentCalls.length > 0 ? recentCalls : [{ title: "No new notifications", description: "You're all caught up!", isUnread: false }]);
        }
      } catch (err) {
        console.error("Error fetching notifications", err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchNotifications();
  }, []);

  return (
    <Card className={cn("w-[380px]", className)} {...props}>
      <CardHeader>
        <CardTitle>Notifications</CardTitle>
        <CardDescription>
          {loading ? "Loading..." : `You have ${notifications.filter(n => n.isUnread).length} unread messages.`}
        </CardDescription>
      </CardHeader>
      <CardContent className="grid gap-4">
        <div className=" flex items-center space-x-4 rounded-md border p-4">
          <BellRing className="text-[#46a79d]" />
          <div className="flex-1 space-y-1">
            <p className="text-sm font-medium leading-none">
              Push Notifications
            </p>
            <p className="text-sm text-muted-foreground">
              Send notifications to device.
            </p>
          </div>
          <Switch />
        </div>
        <div>
          {notifications.map((notification, index) => (
            <div
              key={index}
              className="mb-4 grid grid-cols-[25px_1fr] items-start pb-4 last:mb-0 last:pb-0"
            >
              <span className={`flex h-2 w-2 translate-y-1 rounded-full ${notification.isUnread ? 'bg-[#46a79d]' : 'bg-gray-300'}`} />
              <div className="space-y-1">
                <p className="text-sm font-medium leading-none text-gray-800">
                  {notification.title}
                </p>
                <p className="text-xs text-muted-foreground">
                  {notification.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
      <CardFooter>
        <Button className="w-full bg-gray-900 hover:bg-gray-800" onClick={() => setNotifications(notifications.map(n => ({...n, isUnread: false})))}>
          <Check className="mr-2 h-4 w-4" /> Mark all as read
        </Button>
      </CardFooter>
    </Card>
  )
}
