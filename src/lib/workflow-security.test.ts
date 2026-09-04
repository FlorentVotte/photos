import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const workflowText = (fileName: string) =>
  readFileSync(join(process.cwd(), ".github", "workflows", fileName), "utf8");

describe("GitHub workflow supply-chain controls", () => {
  it("pins every workflow action to an immutable commit SHA", () => {
    const workflows = [workflowText("deploy.yml"), workflowText("codeql.yml")]
      .join("\n")
      .split("\n")
      .filter((line) => !/^\s*#/.test(line));
    const actionReferences = workflows.flatMap((line) =>
      [...line.matchAll(/\buses:\s*([^\s#]+)/g)].map((match) => match[1]),
    );

    expect(actionReferences.length).toBeGreaterThan(0);
    for (const actionReference of actionReferences) {
      expect(actionReference).toMatch(/@[0-9a-f]{40}$/);
    }
  });

  it("deploys the exact build image reference to the photobook service", () => {
    const deployWorkflow = workflowText("deploy.yml");
    const imageReference = "${REGISTRY}/${IMAGE_NAME}:${GITHUB_SHA}";
    const imageOutput = "image_ref=${REGISTRY}/${IMAGE_NAME}:${GITHUB_SHA}";
    const imageExport =
      "export PHOTOBOOK_IMAGE='${{ needs.build.outputs.image_ref }}'";

    expect(deployWorkflow).toContain(imageOutput);
    expect(deployWorkflow).not.toMatch(/\b(?:photos|photobook):latest\b/);
    expect(deployWorkflow).not.toContain("type=raw,value=latest");
    expect(deployWorkflow).toContain("type=sha,format=long,prefix=");
    expect(deployWorkflow).toContain(imageReference);
    expect(deployWorkflow).toContain(imageExport);

    const exportIndex = deployWorkflow.indexOf(imageExport);
    const pullIndex = deployWorkflow.indexOf("docker compose pull photobook");
    const upIndex = deployWorkflow.indexOf("docker compose up -d photobook");

    expect(exportIndex).toBeGreaterThanOrEqual(0);
    expect(pullIndex).toBeGreaterThan(exportIndex);
    expect(upIndex).toBeGreaterThan(pullIndex);
  });
});
