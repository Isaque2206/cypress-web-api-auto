import * as allure from "allure-js-commons";
import { enderecos } from "../../lib/serverest";

export interface CenarioAllure {
  id: string;
  epic: "Frontend" | "API";
  feature: string;
  story: string;
  severity: "blocker" | "critical" | "normal" | "minor" | "trivial";
  description: string;
  tags: string[];
}

export function descreverCenario(cenario: CenarioAllure): Promise<unknown> {
  const superficie =
    cenario.epic === "Frontend" ? enderecos.frontend : enderecos.api;

  return Promise.all([
    allure.parentSuite("ServeRest"),
    allure.suite(cenario.epic),
    allure.subSuite(cenario.feature),
    allure.epic(cenario.epic),
    allure.feature(cenario.feature),
    allure.story(cenario.story),
    allure.severity(cenario.severity),
    allure.owner("Analista de Qualidade"),
    allure.layer(cenario.epic === "Frontend" ? "e2e" : "api"),
    allure.allureId(cenario.id),
    allure.testCaseId(cenario.id),
    allure.tags(...cenario.tags),
    allure.link(superficie, cenario.epic === "Frontend" ? "Frontend ServeRest" : "Swagger ServeRest"),
    allure.description(cenario.description),
  ]);
}
