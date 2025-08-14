import { redisClient } from "./client"
import { nanoid } from "nanoid"

export interface Job {
  id: string
  customerId: string
  registration: string
  make: string
  model: string
  year: number
  engineSize: string
  fuelType: string
  serviceType: string
  description: string
  requiredTools: string[]
  customerPostcode: string
  status: "pending" | "open" | "in_progress" | "completed" | "cancelled"
  customerPrice?: number
  dealerQuote?: number
  dealerId?: string
  createdAt: string
  updatedAt: string
}

export interface Dealer {
  id: string
  userId: string
  businessName: string
  businessAddress: string
  businessPostcode: string
  radiusMiles: number
  status: "pending" | "active" | "suspended"
  certifications: string[]
  insuranceDetails: string
  vatNumber?: string
  tools: string[]
  createdAt: string
  updatedAt: string
}

export interface Message {
  id: string
  jobId: string
  senderId: string
  recipientId: string
  dealerId?: string
  content: string
  createdAt: string
}

export interface Payment {
  id: string
  userId: string
  amount: number
  currency: string
  paymentType: "job_posting" | "dealer_subscription"
  referenceId: string
  status: "pending" | "completed" | "failed"
  createdAt: string
  updatedAt: string
}

export const ExtendedRedisKeys = {
  job: (id: string) => `job:${id}`,
  jobsByCustomer: (customerId: string) => `customer_jobs:${customerId}`,
  jobsByDealer: (dealerId: string) => `dealer_jobs:${dealerId}`,
  dealer: (id: string) => `dealer:${id}`,
  dealerByUser: (userId: string) => `dealer_user:${userId}`,
  message: (id: string) => `message:${id}`,
  messagesByJob: (jobId: string) => `job_messages:${jobId}`,
  payment: (id: string) => `payment:${id}`,
  paymentsByUser: (userId: string) => `user_payments:${userId}`,
  allJobs: () => `all_jobs`,
  allDealers: () => `all_dealers`,
}

export class JobModel {
  static async create(jobData: Omit<Job, "id" | "createdAt" | "updatedAt">): Promise<Job> {
    const jobId = nanoid()
    const now = new Date().toISOString()

    const job: Job = {
      id: jobId,
      ...jobData,
      createdAt: now,
      updatedAt: now,
    }

    // Store job
    await redisClient.set(ExtendedRedisKeys.job(jobId), JSON.stringify(job))

    // Add to customer's jobs
    await redisClient.sadd(ExtendedRedisKeys.jobsByCustomer(jobData.customerId), jobId)

    // Add to all jobs list
    await redisClient.sadd(ExtendedRedisKeys.allJobs(), jobId)

    return job
  }

  static async findById(id: string): Promise<Job | null> {
    const jobData = await redisClient.get(ExtendedRedisKeys.job(id))
    return jobData ? JSON.parse(jobData as string) : null
  }

  static async findByCustomer(customerId: string): Promise<Job[]> {
    const jobIds = await redisClient.smembers(ExtendedRedisKeys.jobsByCustomer(customerId))
    const jobs = []

    for (const jobId of jobIds) {
      const job = await this.findById(jobId as string)
      if (job) jobs.push(job)
    }

    return jobs.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
  }

  static async findAll(): Promise<Job[]> {
    const jobIds = await redisClient.smembers(ExtendedRedisKeys.allJobs())
    const jobs = []

    for (const jobId of jobIds) {
      const job = await this.findById(jobId as string)
      if (job) jobs.push(job)
    }

    return jobs.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
  }

  static async update(id: string, updates: Partial<Omit<Job, "id" | "createdAt">>): Promise<Job | null> {
    const job = await this.findById(id)
    if (!job) return null

    const updatedJob = {
      ...job,
      ...updates,
      updatedAt: new Date().toISOString(),
    }

    await redisClient.set(ExtendedRedisKeys.job(id), JSON.stringify(updatedJob))
    return updatedJob
  }
}

export class DealerModel {
  static async create(dealerData: Omit<Dealer, "id" | "createdAt" | "updatedAt">): Promise<Dealer> {
    const dealerId = nanoid()
    const now = new Date().toISOString()

    const dealer: Dealer = {
      id: dealerId,
      ...dealerData,
      createdAt: now,
      updatedAt: now,
    }

    // Store dealer
    await redisClient.set(ExtendedRedisKeys.dealer(dealerId), JSON.stringify(dealer))

    // Create user-to-dealer mapping
    await redisClient.set(ExtendedRedisKeys.dealerByUser(dealerData.userId), dealerId)

    // Add to all dealers list
    await redisClient.sadd(ExtendedRedisKeys.allDealers(), dealerId)

    return dealer
  }

  static async findById(id: string): Promise<Dealer | null> {
    const dealerData = await redisClient.get(ExtendedRedisKeys.dealer(id))
    return dealerData ? JSON.parse(dealerData as string) : null
  }

  static async findByUserId(userId: string): Promise<Dealer | null> {
    const dealerId = await redisClient.get(ExtendedRedisKeys.dealerByUser(userId))
    if (!dealerId) return null

    return this.findById(dealerId as string)
  }

  static async findAll(): Promise<Dealer[]> {
    const dealerIds = await redisClient.smembers(ExtendedRedisKeys.allDealers())
    const dealers = []

    for (const dealerId of dealerIds) {
      const dealer = await this.findById(dealerId as string)
      if (dealer) dealers.push(dealer)
    }

    return dealers.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
  }

  static async update(id: string, updates: Partial<Omit<Dealer, "id" | "createdAt">>): Promise<Dealer | null> {
    const dealer = await this.findById(id)
    if (!dealer) return null

    const updatedDealer = {
      ...dealer,
      ...updates,
      updatedAt: new Date().toISOString(),
    }

    await redisClient.set(ExtendedRedisKeys.dealer(id), JSON.stringify(updatedDealer))
    return updatedDealer
  }
}

export class MessageModel {
  static async create(messageData: Omit<Message, "id" | "createdAt">): Promise<Message> {
    const messageId = nanoid()
    const now = new Date().toISOString()

    const message: Message = {
      id: messageId,
      ...messageData,
      createdAt: now,
    }

    // Store message
    await redisClient.set(ExtendedRedisKeys.message(messageId), JSON.stringify(message))

    // Add to job's messages
    await redisClient.sadd(ExtendedRedisKeys.messagesByJob(messageData.jobId), messageId)

    return message
  }

  static async findById(id: string): Promise<Message | null> {
    const messageData = await redisClient.get(ExtendedRedisKeys.message(id))
    return messageData ? JSON.parse(messageData as string) : null
  }

  static async findByJob(jobId: string): Promise<Message[]> {
    const messageIds = await redisClient.smembers(ExtendedRedisKeys.messagesByJob(jobId))
    const messages = []

    for (const messageId of messageIds) {
      const message = await this.findById(messageId as string)
      if (message) messages.push(message)
    }

    return messages.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
  }
}

export class PaymentModel {
  static async create(paymentData: Omit<Payment, "id" | "createdAt" | "updatedAt">): Promise<Payment> {
    const paymentId = nanoid()
    const now = new Date().toISOString()

    const payment: Payment = {
      id: paymentId,
      ...paymentData,
      createdAt: now,
      updatedAt: now,
    }

    // Store payment
    await redisClient.set(ExtendedRedisKeys.payment(paymentId), JSON.stringify(payment))

    // Add to user's payments
    await redisClient.sadd(ExtendedRedisKeys.paymentsByUser(paymentData.userId), paymentId)

    return payment
  }

  static async findById(id: string): Promise<Payment | null> {
    const paymentData = await redisClient.get(ExtendedRedisKeys.payment(id))
    return paymentData ? JSON.parse(paymentData as string) : null
  }

  static async findByUser(userId: string): Promise<Payment[]> {
    const paymentIds = await redisClient.smembers(ExtendedRedisKeys.paymentsByUser(userId))
    const payments = []

    for (const paymentId of paymentIds) {
      const payment = await this.findById(paymentId as string)
      if (payment) payments.push(payment)
    }

    return payments.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
  }

  static async update(id: string, updates: Partial<Omit<Payment, "id" | "createdAt">>): Promise<Payment | null> {
    const payment = await this.findById(id)
    if (!payment) return null

    const updatedPayment = {
      ...payment,
      ...updates,
      updatedAt: new Date().toISOString(),
    }

    await redisClient.set(ExtendedRedisKeys.payment(id), JSON.stringify(updatedPayment))
    return updatedPayment
  }
}
