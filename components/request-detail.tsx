import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { FileText, User, Clock, Calendar, Mail, MessageSquare, Send, Paperclip, Phone } from "lucide-react"
import type { RequestDetail as RequestDetailType } from "@/types/dashboard"
import StatusBadge from "./status-badge"
import { format } from "date-fns"

export function RequestDetailComponent({
  request,
}: {
  request: RequestDetailType
}) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
      <div className="lg:col-span-2 space-y-6">
        <Card className="bg-white dark:bg-gray-800 shadow-lg rounded-xl overflow-hidden border-l-8 border-[#1B4332]">
          <CardHeader className="bg-gray-50 dark:bg-gray-700/50 p-6">
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-3">
                  <FileText className="h-8 w-8 text-[#1B4332] dark:text-green-400" />
                  <div>
                    <CardTitle className="text-2xl font-bold text-gray-800 dark:text-gray-100">
                      Request Details
                    </CardTitle>
                    <CardDescription className="text-gray-500 dark:text-gray-400">
                      Ticket #{request.ticketNumber}
                    </CardDescription>
                  </div>
                </div>
              </div>
              <StatusBadge status={request.status} />
            </div>
          </CardHeader>
          <CardContent className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
            <div className="space-y-4">
              <div className="flex items-start">
                <User className="h-5 w-5 text-gray-500 mr-3 mt-1" />
                <div>
                  <p className="font-semibold text-gray-700 dark:text-gray-300">Learner Name</p>
                  <p className="text-gray-600 dark:text-gray-400">{request.learnerName}</p>
                </div>
              </div>
              <div className="flex items-start">
                <Calendar className="h-5 w-5 text-gray-500 mr-3 mt-1" />
                <div>
                  <p className="font-semibold text-gray-700 dark:text-gray-300">Submitted</p>
                  <p className="text-gray-600 dark:text-gray-400">{format(new Date(request.submittedDate), "PPP p")}</p>
                </div>
              </div>
              <div className="flex items-start">
                <Clock className="h-5 w-5 text-gray-500 mr-3 mt-1" />
                <div>
                  <p className="font-semibold text-gray-700 dark:text-gray-300">Estimated Completion</p>
                  <p className="text-gray-600 dark:text-gray-400">
                    {format(new Date(request.estimatedCompletion), "PPP")}
                  </p>
                </div>
              </div>
            </div>
            <div className="space-y-4">
              <div className="flex items-start">
                <p className="font-semibold text-gray-700 dark:text-gray-300 w-32">Purpose</p>
                <p className="text-gray-600 dark:text-gray-400">{request.purpose}</p>
              </div>
              <div className="flex items-start">
                <p className="font-semibold text-gray-700 dark:text-gray-300 w-32">Delivery</p>
                <p className="text-gray-600 dark:text-gray-400 capitalize">{request.deliveryMethod}</p>
              </div>
              <div className="flex items-start">
                <p className="font-semibold text-gray-700 dark:text-gray-300 w-32">Requester</p>
                <p className="text-gray-600 dark:text-gray-400">{request.formData.requesterName}</p>
              </div>
              <div className="flex items-start">
                <Mail className="h-5 w-5 text-gray-500 mr-3 mt-1" />
                <div>
                  <p className="font-semibold text-gray-700 dark:text-gray-300">Requester Email</p>
                  <p className="text-gray-600 dark:text-gray-400">{request.requesterEmail}</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white dark:bg-gray-800 shadow-lg rounded-xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-xl font-bold text-gray-800 dark:text-gray-100">
              <MessageSquare className="text-[#1B4332] dark:text-green-400" />
              Communication History
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4 max-h-96 overflow-y-auto pr-2">
              {request.comments.map((comment) => (
                <div key={comment.id} className="flex items-start gap-4">
                  <Avatar>
                    <AvatarImage src="/placeholder-user.jpg" />
                    <AvatarFallback>{comment.author.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div className="w-full rounded-lg border bg-gray-50 dark:bg-gray-700/50 p-3 text-sm">
                    <div className="flex justify-between items-center mb-1">
                      <p className="font-semibold text-gray-800 dark:text-gray-200">{comment.author}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {format(new Date(comment.timestamp), "PPp")}
                      </p>
                    </div>
                    <p className="text-gray-600 dark:text-gray-300">{comment.message}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="relative">
              <Textarea placeholder="Type your message here..." className="pr-24" />
              <div className="absolute top-2 right-2 flex items-center gap-2">
                <Button variant="ghost" size="icon" className="text-gray-500 hover:text-gray-700">
                  <Paperclip className="h-5 w-5" />
                </Button>
                <Button size="sm" className="bg-[#1B4332] hover:bg-[#2d6a4f] text-white">
                  Send
                  <Send className="h-4 w-4 ml-2" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="space-y-6">
        <Card className="bg-white dark:bg-gray-800 shadow-lg rounded-xl">
          <CardHeader>
            <CardTitle className="text-xl font-bold text-gray-800 dark:text-gray-100">Timeline</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-4">
              {request.timeline.map((event, index) => (
                <li key={index} className="flex gap-4">
                  <div className="flex flex-col items-center">
                    <div className="w-4 h-4 rounded-full bg-[#1B4332] dark:bg-green-400 mt-1" />
                    {index < request.timeline.length - 1 && (
                      <div className="w-0.5 flex-1 bg-gray-300 dark:bg-gray-600" />
                    )}
                  </div>
                  <div>
                    <p className="font-semibold text-gray-700 dark:text-gray-300">{event.description}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{format(new Date(event.date), "PPp")}</p>
                  </div>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
        <Card className="bg-white dark:bg-gray-800 shadow-lg rounded-xl">
          <CardHeader>
            <CardTitle className="text-xl font-bold text-gray-800 dark:text-gray-100">Contact Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div className="flex items-center gap-3">
              <Mail className="h-5 w-5 text-gray-500" />
              <p className="text-gray-600 dark:text-gray-400">{request.requesterEmail}</p>
            </div>
            <div className="flex items-center gap-3">
              <Phone className="h-5 w-5 text-gray-500" />
              <p className="text-gray-600 dark:text-gray-400">{request.formData.mobileNumber}</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export { RequestDetailComponent as RequestDetail }
