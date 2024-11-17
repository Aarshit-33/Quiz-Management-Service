import { Groq } from "groq-sdk";
const apiKey = "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";
const groq = new Groq({ apiKey });
async function generateHint(paragraph) {
	const prompt = `Summarize the following text in 100 wrods maximum. Only return the summary, without any additional explanations or introductory phrases. Text: ${paragraph}`;

	const chatCompletion = await groq.chat.completions.create({
		messages: [
			{
				role: "user",
				content: prompt,
			},
		],
		model: "gemma-7b-it",
		temperature: 0,
		max_tokens: 1024,
		top_p: 1,
		stream: true,
		stop: null,
	});

	let para = "";
	for await (const chunk of chatCompletion) {
		para += chunk.choices[0]?.delta?.content || "";
		// process.stdout.write(chunk.choices[0]?.delta?.content || "");
	}

	return para;
}
let para =
	"Then came the night of the first falling star. It was seen early in the morning, rushing over Winchester eastward, a line of flame high in the atmosphere. Hundreds must have seen it and taken it for an ordinary falling star. It seemed that it fell to earth about one hundred miles east of him.";
let ans = await generateHint(para);
console.log(ans);
