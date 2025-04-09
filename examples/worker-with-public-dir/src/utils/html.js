export function getHtmlResponse(body) {
	return new Response(
		`
			<!DOCTYPE html>
			<html lang="en">
			<head>
				<meta charset="UTF-8">
				<meta name="viewport" content="width=device-width, initial-scale=1.0">
				<title>Worker With Public Dir</title>
			</head>
			<body>${body}</body>
			</html>
		`,
		{
			headers: { "Content-Type": "text/html" },
		}
	);
}
