import * as cdk from "aws-cdk-lib";
import * as lambda from "aws-cdk-lib/aws-lambda";
import * as ec2 from "aws-cdk-lib/aws-ec2";
import * as logs from "aws-cdk-lib/aws-logs";
import * as iam from "aws-cdk-lib/aws-iam";

import { Construct } from "constructs";
// import * as sqs from 'aws-cdk-lib/aws-sqs';

export class CdkMilestoneStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const vpcMilestone = new ec2.Vpc(this, "milestone-cdk-test", {
      maxAzs: 3,
      natGateways: 1,
    });

    const securityGroup = new ec2.SecurityGroup(this, "LambdaSG", {
      vpc: vpcMilestone,
    });

    const lambdaFunction = new lambda.Function(this, "milestone-cdk-def", {
      runtime: lambda.Runtime.NODEJS_22_X,
      handler: "index.handler",
      code: lambda.Code.fromAsset("lambda"),
      vpc: vpcMilestone,
      logRetention: logs.RetentionDays.ONE_WEEK,
      environment: {
        VPC_ID: vpcMilestone.vpcId,
      },
      securityGroups: [securityGroup],
    });

    lambdaFunction.addToRolePolicy(
      new iam.PolicyStatement({
        actions: ["ec2:DescribeInstances"],
        resources: ["*"],
      })
    );

    new logs.LogGroup(this, "Milestone-cdk-logGroup", {
      logGroupName: "/aws/lambda/" + lambdaFunction.functionName,
      retention: logs.RetentionDays.ONE_DAY,
    });

    new ec2.GatewayVpcEndpoint(this, "S3Gateway-endpoint", {
      vpc: vpcMilestone,
      service: ec2.GatewayVpcEndpointAwsService.S3,
      subnets: [{ subnetType: ec2.SubnetType.PRIVATE_WITH_NAT }],
    });
  }
}
