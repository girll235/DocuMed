import type React from "react"
export const Card = ({ children, className }: { children: React.ReactNode; className?: string }) => (
  <div className={`border border-gray-200 rounded-lg shadow-md p-4 ${className}`}>{children}</div>
)

export const CardBody = ({ children }: { children: React.ReactNode }) => <div>{children}</div>

