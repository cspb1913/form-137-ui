import React from 'react'
export const BotIDProvider = ({ children }: { children: React.ReactNode }) => <>{children}</>
export const useBotID = () => ({
  isBot: false,
  botType: null,
  confidence: 0,
  isLoading: false,
  trackActivity: jest.fn(),
})
