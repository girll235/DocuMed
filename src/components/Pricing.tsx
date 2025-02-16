"use client"

import { useState } from "react"
import Link from "next/link"
import { motion } from "framer-motion"
import { Check, X } from "lucide-react"
import { PRICING_PLANS } from "@/lib/constants"
import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card"
import { ROUTES } from "@/lib/constants"
import { useUser } from "@/contexts/UserContext"
import { PricingFeature } from "@/types"

const Pricing = () => {
  const [billingCycle, setBillingCycle] = useState<"monthly" | "yearly">("yearly")
  const { userData, role } = useUser()

  const calculatePrice = (price: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
    }).format(price)
  }

  const getSignUpRoute = () => {
    if (userData) {
      return role === "DOCTOR" ? ROUTES.DOC_DASHBOARD : ROUTES.CLIENT_DASHBOARD
    }
    return ROUTES.CLIENT_SIGNUP
  }

  return (
    <div className="container mx-auto px-4 py-16">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold mb-4">Simple, Transparent Pricing</h1>
        <p className="text-lg text-gray-600 mb-8">
          Choose the plan that best suits your needs
        </p>
        
        <div className="flex items-center justify-center gap-4 mb-8">
          <button
            onClick={() => setBillingCycle("monthly")}
            className={`px-6 py-2 rounded-lg transition-all duration-300 ${
              billingCycle === "monthly"
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-muted-foreground"
            }`}
          >
            Monthly
          </button>
          <button
            onClick={() => setBillingCycle("yearly")}
            className={`px-6 py-2 rounded-lg transition-all duration-300 ${
              billingCycle === "yearly"
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-muted-foreground"
            }`}
          >
            Yearly
            <span className="ml-2 text-sm bg-green-100 text-green-800 px-2 py-1 rounded">
              Save 20%
            </span>
          </button>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-8">
        {PRICING_PLANS.map((plan, index) => (
          <motion.div
            key={plan.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.1 }}
          >
            <Card
              className={`relative ${
                plan.isPopular ? "border-2 border-primary" : ""
              }`}
            >
              {plan.isPopular && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <span className="bg-primary text-primary-foreground px-4 py-1 rounded-full text-sm">
                    Most Popular
                  </span>
                </div>
              )}
              
              <CardHeader>
                <CardTitle className="text-xl font-semibold text-center">
                  {plan.name}
                </CardTitle>
                <div className="text-center mt-4">
                  <div className="text-5xl font-bold">
                    {calculatePrice(plan.price[billingCycle])}
                  </div>
                  <div className="text-muted-foreground mt-2">
                    per {billingCycle === "monthly" ? "month" : "year"}
                  </div>
                </div>
              </CardHeader>

              <CardContent>
              <ul className="space-y-4 mb-8">
                {plan.features.map((feature: PricingFeature, featureIndex: number) => (
                  <li
                    key={featureIndex}
                    className="flex items-center"
                  >
                    {feature.included ? (
                      <Check className="w-5 h-5 mr-2 text-green-500" />
                    ) : (
                      <X className="w-5 h-5 mr-2 text-muted-foreground" />
                    )}
                    <span
                      className={
                        feature.included ? "text-foreground" : "text-muted-foreground"
                      }
                    >
                      {feature.name}
                    </span>
                  </li>
                ))}
              </ul>
                <Link href={getSignUpRoute()} className="block">
                  <Button
                    className={`w-full ${
                      plan.isPopular
                        ? "bg-primary hover:bg-primary/90"
                        : "bg-secondary hover:bg-secondary/90"
                    }`}
                  >
                    {userData ? "Go to Dashboard" : "Get Started"}
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      <div className="mt-16 text-center">
        <h3 className="text-2xl font-semibold mb-4">Need a custom plan?</h3>
        <p className="text-muted-foreground mb-6">
          Contact us for custom pricing and features tailored to your needs.
        </p>
        <Link href={ROUTES.CONTACT}>
          <Button variant="outline">Contact Sales</Button>
        </Link>
      </div>
    </div>
  )
}

export default Pricing