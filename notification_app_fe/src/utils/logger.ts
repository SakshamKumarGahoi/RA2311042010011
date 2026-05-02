let authToken = "";

export function initLogger(config: { authToken: string }) {
  authToken = config.authToken;
}

export async function Log(
  service: string,
  level: string,
  component: string,
  message: string
): Promise<void> {
  const timestamp = new Date().toISOString();
  const logEntry = { timestamp, service, level, component, message };
  console.log(JSON.stringify(logEntry));
}
