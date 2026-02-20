import { LambdaEvent } from '../../shared/src/interfaces';
import { createBadge, isPipelineBool } from '../../shared/src/controller';
const {
    CodePipelineClient,
    GetPipelineExecutionCommand,
    ListActionExecutionsCommand,
} = require('@aws-sdk/client-codepipeline');

const cpClient = new CodePipelineClient({ region: process.env.AWS_REGION || 'ca-central-1' });

let svgTemplate = `
<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="TOTAL_WIDTH" height="20" role="img" aria-label="LABEL: VALUE">
  <linearGradient id="s" x2="0" y2="100%">
    <stop offset="0" stop-color="#bbb" stop-opacity=".1"/>
    <stop offset="1" stop-opacity=".1"/>
  </linearGradient>
  <clipPath id="r">
    <rect width="TOTAL_WIDTH" height="20" rx="3" fill="#fff"/>
  </clipPath>
  <g clip-path="url(#r)">
    <rect width="LABEL_WIDTH" height="20" fill="#555"/>
    <rect x="LABEL_WIDTH" width="VALUE_WIDTH" height="20" fill="COLOR"/>
    <rect width="TOTAL_WIDTH" height="20" fill="url(#s)"/>
  </g>
  <g fill="#fff" text-anchor="middle" font-family="Verdana,Geneva,DejaVu Sans,sans-serif" text-rendering="geometricPrecision" font-size="110">
    <text x="LABEL_X" y="140" transform="scale(.1)" fill="#fff" textLength="LABEL_TEXT_LENGTH">LABEL</text>
    <text x="VALUE_X" y="140" transform="scale(.1)" fill="#fff" textLength="VALUE_TEXT_LENGTH">VALUE</text>
  </g>
</svg>
`;

function generateBadgeSvg(label: string, value: string, color: string = '#4c1'): Buffer {
    const labelWidth = label.length * 8 + 12;
    const valueWidth = value.length * 7 + 14;
    const totalWidth = labelWidth + valueWidth;
    let svg = svgTemplate.replace(/TOTAL_WIDTH/g, totalWidth.toString());
    svg = svg.replace(/LABEL_WIDTH/g, labelWidth.toString());
    svg = svg.replace(/VALUE_WIDTH/g, valueWidth.toString());
    svg = svg.replace(/LABEL_X/g, (labelWidth * 5).toString());
    svg = svg.replace(/VALUE_X/g, ((labelWidth + valueWidth / 2) * 10).toString());
    svg = svg.replace(/LABEL_TEXT_LENGTH/g, (label.length * 70).toString());
    svg = svg.replace(/VALUE_TEXT_LENGTH/g, (value.length * 65).toString());
    svg = svg.replace(/LABEL/g, label);
    svg = svg.replace(/VALUE/g, value);
    svg = svg.replace(/COLOR/g, color);
    return Buffer.from(svg);
}

async function getExecutionMetadata(
    event: LambdaEvent,
): Promise<{ author: string; commitId: string; timestamp: string }> {
    let author = 'System';
    let commitId = 'N/A';
    let timestamp = event.time
        ? event.time.replace('T', ' ').split('.')[0]
        : new Date()
              .toISOString()
              .replace('T', ' ')
              .split('.')[0];

    try {
        const execution = await cpClient.send(
            new GetPipelineExecutionCommand({
                pipelineName: event.detail.pipeline,
                pipelineExecutionId: event.detail['execution-id'],
            }),
        );

        if (
            execution.pipelineExecution &&
            execution.pipelineExecution.artifactRevisions &&
            execution.pipelineExecution.artifactRevisions.length > 0
        ) {
            commitId = execution.pipelineExecution.artifactRevisions[0].revisionId || 'N/A';
        }

        const actions = await cpClient.send(
            new ListActionExecutionsCommand({
                pipelineName: event.detail.pipeline,
                filter: { pipelineExecutionId: event.detail['execution-id'] },
            }),
        );

        const sourceAction = actions.actionExecutionDetails.find(
            (a: any) => a.stageName === 'Source' || a.actionName === 'Source',
        );
        if (sourceAction && sourceAction.output) {
            const vars = sourceAction.output.outputVariables || sourceAction.output.executionVariables || {};
            author = vars.AuthorDisplayName || vars.AuthorName || vars.AuthorId || author;
        } else if (execution.pipelineExecution && execution.pipelineExecution.artifactRevisions) {
            const rev = execution.pipelineExecution.artifactRevisions[0];
            const summary = rev.revisionSummary ? JSON.parse(rev.revisionSummary) : {};
            author = summary.AuthorName || summary.author || author;
        }
    } catch (e) {
        console.error('Error fetching metadata:', e);
    }

    return { author, commitId, timestamp };
}

export async function createCommitIdBadge(event: LambdaEvent) {
    const isPipeline = isPipelineBool(event);
    if (!isPipeline) return 'Not a pipeline event';

    const project = event.detail.pipeline;
    let suffix = event.detail.stage ? `-${event.detail.stage}` : '';

    const meta = await getExecutionMetadata(event);

    const promises = [];

    // Commit ID badge (Gray)
    promises.push(
        createBadge(
            `${project}${suffix}-commitId.svg`,
            generateBadgeSvg('commit', meta.commitId.substring(0, 8), '#9f9f9f'),
        ),
    );

    // Timestamp badge (Blue)
    promises.push(
        createBadge(`${project}${suffix}-timestamp.svg`, generateBadgeSvg('date', meta.timestamp, '#007ec6')),
    );

    // Author badge (Orange for better contrast)
    promises.push(createBadge(`${project}${suffix}-author.svg`, generateBadgeSvg('author', meta.author, '#fe7d37')));

    return Promise.all(promises)
        .then(() => 'Success')
        .catch(err => `Error: ${err}`);
}

export { LambdaEvent } from '../../shared/src/interfaces';
