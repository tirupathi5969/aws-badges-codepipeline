interface Detail {
    // CodeBuild
    'project-name'?: string;
    'build-status'?: string;

    // CodePipeline
    pipeline?: string;
    stage?: string;
    action?: string;
    state?: string;
    'execution-id'?: string;
    version?: number;
}

export interface LambdaEvent {
    detail: Detail;
    version?: string;
    id?: string;
    'build-id'?: string;
    'detail-type'?: string;
    source?: string;
    account?: string;
    time?: string;
    region?: string;
    resources?: object;
}
