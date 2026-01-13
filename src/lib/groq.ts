import Groq from "groq-sdk"

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY
})

export async function getGroqChatCompletion(messages: Array<{ role: string; content: string }>) {
  return groq.chat.completions.create({
    messages: messages as any,
    model: "llama-3.3-70b-versatile", // Updated to current model (llama-3.1-70b-versatile was decommissioned)
  })
}

export async function getFinancialInsights(transactions: any[], budgets: any[], loans: any[]) {
  const prompt = `Analyze the following financial data and provide actionable insights:

Transactions Summary:
- Total transactions: ${transactions.length}
- Income: ₹${transactions.filter((t) => t.type === "income").reduce((sum, t) => sum + Number(t.amount || 0), 0).toLocaleString()}
- Expenses: ₹${transactions.filter((t) => t.type === "expense").reduce((sum, t) => sum + Number(t.amount || 0), 0).toLocaleString()}

Top spending categories:
${transactions
  .filter((t) => t.type === "expense")
  .reduce((acc: any, t) => {
    const cat = t.category_name || "Uncategorized"
    acc[cat] = (acc[cat] || 0) + Number(t.amount || 0)
    return acc
  }, {})
  ? Object.entries(
      transactions
        .filter((t) => t.type === "expense")
        .reduce((acc: any, t) => {
          const cat = t.category_name || "Uncategorized"
          acc[cat] = (acc[cat] || 0) + Number(t.amount || 0)
          return acc
        }, {})
    )
      .sort((a: any, b: any) => b[1] - a[1])
      .slice(0, 5)
      .map(([cat, amount]: any) => `- ${cat}: ₹${amount.toLocaleString()}`)
      .join("\n")
  : "No data"}

Budgets:
${budgets.length > 0 ? budgets.map((b) => `- ${b.category_name}: ₹${b.current_spent || 0}/${b.monthly_limit} (${((b.current_spent || 0) / b.monthly_limit * 100).toFixed(1)}%)`).join("\n") : "No budgets set"}

Loans:
${loans.length > 0 ? loans.map((l) => `- ${l.name}: ₹${l.remaining_amount} remaining of ₹${l.total_amount}`).join("\n") : "No loans"}

Provide:
1. 3 key insights about spending patterns
2. 2 actionable recommendations to improve savings
3. 1 warning if any budgets are at risk
4. Overall financial health assessment (1-2 sentences)

Keep it concise and actionable. Format as a JSON object with keys: insights, recommendations, warnings, assessment.`

  const response = await getGroqChatCompletion([
    {
      role: "user",
      content: prompt,
    },
  ])

  const content = response.choices[0]?.message?.content || ""
  
  // Try to parse JSON, fallback to plain text
  try {
    const jsonMatch = content.match(/\{[\s\S]*\}/)
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0])
    }
  } catch (e) {
    // If parsing fails, return as text
  }

  return {
    insights: [content],
    recommendations: [],
    warnings: [],
    assessment: content,
  }
}

