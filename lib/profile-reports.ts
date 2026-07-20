export type ProfileReportType = 'account_security' | 'payment' | 'content' | 'feedback' | 'other'
export type ProfileReportStatus = 'pending' | 'reply' | 'resolved'

export type ProfileReportSummary = {
  id: string
  reference: string
  subject: string
  type: ProfileReportType
  createdAt: string
  status: ProfileReportStatus
}

export type ProfileReportAttachment = {
  id: string
  url: string
  contentType: string
  sizeBytes: number
  name: string
}

export type ProfileReportMessage = {
  id: string
  senderType: 'member' | 'admin'
  senderName: string
  message: string
  createdAt: string
  attachments: ProfileReportAttachment[]
}

export type ProfileReportDetail = ProfileReportSummary & {
  canReply: boolean
  messages: ProfileReportMessage[]
}

export const PROFILE_REPORT_TYPE_LABELS: Record<ProfileReportType, string> = {
  account_security: 'บัญชีและความปลอดภัย',
  payment: 'การเติมเงิน / ชำระเงิน',
  content: 'เนื้อหา / นิยาย',
  feedback: 'ข้อเสนอแนะ',
  other: 'อื่นๆ',
}

export const PROFILE_REPORT_STATUS_LABELS: Record<ProfileReportStatus, string> = {
  pending: 'รอดำเนินการ',
  reply: 'ตอบกลับ',
  resolved: 'แก้ไขแล้ว',
}
