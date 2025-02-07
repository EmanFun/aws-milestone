import { APIGatewayEvent } from "aws-lambda";

export const handler = async (event: APIGatewayEvent) => {
  const TEAM_WORK_TOKEN = process.env.TEAM_WORK_TOKEN;
  const TEAM_WORK_URL = process.env.TEAM_WORK_URL;
  const base64Token = Buffer.from(`${TEAM_WORK_TOKEN}:x`).toString("base64");

  var myHeaders = new Headers();
  myHeaders.append("access-control-expose-headers", "id,x-page");
  myHeaders.append("Authorization", `Basic ${base64Token}`);

  var requestOptions = {
    method: "GET",
    headers: myHeaders,
    redirect: "follow" as RequestRedirect,
  };

  const res = await fetch(
    `${TEAM_WORK_URL}/projects/435669/tasks.json`,
    requestOptions
  );
  const response = await res.json();
  const formatData = response["tasks"].map(
    (task: { name: string; description: string; status: string }) => {
      return {
        name: task.name,
        description: task.description,
        status: task.status,
      };
    }
  );
  return formatData;
};
