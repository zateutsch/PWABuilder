import type { Arguments, CommandBuilder } from "yargs";
import { execSyncWrapper, outputError, isDirectoryTemplate } from "../util/util";
import { startDescriptions, startErrors } from "../strings/startStrings";
import { initAnalytics, trackEvent } from "../analytics/usage-analytics";
import { StartEventData } from "../analytics/analytics-interfaces";

export const command: string = 'start [viteArgs]';
export const desc: string = startDescriptions.commandDescription;

type StartOptions = {
  viteArgs: string | undefined;
}

export const builder: CommandBuilder<StartOptions, StartOptions> = (yargs) =>
  yargs
    .positional('viteArgs', {type: "string", demandOption: false, description: startDescriptions.viteArgsDescription})
    .usage("$0 start [viteArgs]");

export const handler = (argv: Arguments<StartOptions>): void => {
  const startTime: number = performance.now();
  const { viteArgs } = argv;
  if(isDirectoryTemplate()) {
    handleStartCommand(viteArgs);
  } else {
    outputError(startErrors.invalidDirectory);
  }  
  const endTime: number = performance.now();

  trackStartEvent(endTime - startTime, viteArgs ? viteArgs : "");
};

function handleStartCommand(viteArgs: string | undefined) {
  if(viteArgs) {
    execSyncWrapper('npm run dev-task -- ' + viteArgs, false); 
  } else {
    execSyncWrapper('npm run dev-server', false);
  }
}

async function trackStartEvent(timeMS: number, options: string): Promise<void> {
  if(await initAnalytics()){

    const startEventData: StartEventData = {
      timeMS: timeMS,
      options: options
    }

    trackEvent("start", startEventData);
  }
}