import { createBadge, isPipelineBool } from '../../shared/src/controller';
import { LambdaEvent } from '../../shared/src/interfaces';
import { readFileSync } from 'fs';

export function createStatusBadge(event: LambdaEvent) {
    const isPipeline = isPipelineBool(event);
    let project = isPipeline ? event.detail.pipeline : event.detail['project-name'];
    const status = isPipeline ? event.detail.state : event.detail['build-status'];

    // Add stage or action to project name if present
    if (isPipeline) {
        if (event.detail.stage) {
            project = `${project}-${event.detail.stage}`;
        }
        // Only append action if it is different from stage to avoid things like Source-Source
        if (event.detail.action && event.detail.action !== event.detail.stage) {
            project = `${project}-${event.detail.action}`;
        }
    }

    const file_name = `${isPipeline ? 'pipeline' : 'build'}-${status}.svg`;
    const image_path = process.env.IMAGEPATH ? `./services/status-badges/src/badges/${file_name}` : file_name;
    let body: Buffer;
    try {
        body = readFileSync(image_path);
    } catch (e1) {
        throw new Error(`File doesn't exist - ${image_path}\n${e1}`);
    }
    const key = `${project}.svg`;
    return createBadge(key, body);
}

export { LambdaEvent } from '../../shared/src/interfaces';
