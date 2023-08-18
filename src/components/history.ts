import modal from "../lib/modal/index";
import toast from "../lib/toast/index";
import Match from "../model/Match";
import db from "../utils/db";
import { rerenderRoute, router } from "../utils/router";

export default function history(): Component {
  const histories = db.match.findAll<MatchType[]>();
  const matchInstances: MatchType[] = [];

  const bindEvents = (element: HTMLElement) => {
    const actionButtonList = element.querySelectorAll(
      ".history__action"
    ) as NodeListOf<HTMLElement>;

    actionButtonList.forEach((actionButtons) => {
      actionButtons.addEventListener("click", (event: Event) => {
        const target = event.target as HTMLElement;
        const selectedMatchId = target.dataset.id;
        if (target.classList.contains("history__action--delete")) {
          modal(
            `
            <div class="text--center">
              <p>Are you sure to delete the match?</p>
              <button id="confirmUndoBtn" style="margin:20px" class="btn btn--primary"> Yes </button>
            </div>
          `,
            (element: HTMLElement, callback: Function) => {
              const confirmUndoBtn =
                element.querySelector("#confirmUndoBtn") as HTMLButtonElement;
              confirmUndoBtn.addEventListener("click", () => {
                selectedMatchId &&
                  db.match.deleteOneById<MatchType>(selectedMatchId);
                rerenderRoute();
                callback();
                toast("Match deleted successfully!", {
                  type: "success",
                  timeOut: 1500,
                });
              });
            }
          );
        } else if (target.classList.contains("history__action--resume")) {
          const match = matchInstances.find(
            (matchInstance) => matchInstance._id == selectedMatchId
          );
          match && router("#running-match", [match._id]);
        } else if (target.classList.contains("history__action--scoreboard")) {
          const match = matchInstances.find(
            (matchInstance) => matchInstance._id == selectedMatchId
          );
          match && router("#scoreboard", [match._id]);
        }
      });
    });
  };

  const template = `
    <div class="container">
      <div class="history box-shadow">
        <h3 class="subtitle">Match Histories</h3>
        <div class="history__cards">
        ${histories
          .map((match: MatchType) => {
            Object.setPrototypeOf(match, Match.prototype);
            matchInstances.push(match);
            const currentInningSummary = match.getInningSummary();
            const anotherInningSummary =
              currentInningSummary.previousInning || {
                teamName: match[match.innings.second.team].name,
                run: 0,
                over: "0.0",
                wickets: 0,
              };
            const createdAt = new Date(match.createdAt || "");
            const matchCreationDate = `${createdAt.toDateString()} ${createdAt.toLocaleTimeString()}`;
            return `<div class="history__card">
                  <p>${matchCreationDate}</p>
                  <div class="history__team">
                    <div>
                      <span class="history__avatar">${currentInningSummary.teamName?.charAt(
                        0
                      )}</span>
                      <span class="history__team--name">${
                        currentInningSummary.teamName
                      }</span>
                    </div>
                    <div><span>${currentInningSummary.run}/${
              currentInningSummary.wickets
            }</span> <small>(${currentInningSummary.over})</small></div>
                  </div>
                  <div class="history__team">
                    <div>
                      <span class="history__avatar">${anotherInningSummary.teamName?.charAt(
                        0
                      )}</span>
                      <span class="history__team--name">${
                        anotherInningSummary.teamName
                      }</span>
                    </div>
                    <div><span>${anotherInningSummary.run}/${
              anotherInningSummary.wickets
            }</span> <small>(${anotherInningSummary.over})</small></div>
                  </div>
                  <p>${currentInningSummary.summaryText}</p>
                  <div class="history__action">
                    <button style="${
                      currentInningSummary.isMatchOver && "display:none"
                    }"  data-id="${
              match._id
            }" class="btn history__action--resume">Resume</button>
                    <button  data-id="${
                      match._id
                    }" class="btn history__action--scoreboard">Scoreboard</button>
                    <svg
                      data-id="${match._id}"
                      xmlns="http://www.w3.org/2000/svg"
                      style="font-size: 10px"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      class="history__action--delete"
                    >
                      <path
                        data-id="${match._id}"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="{2}"
                        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                      />
                    </svg>
                  </div>
                </div>`;
          })
          .join("")}
        <p bizIf="${
          histories.length == 0
        }" class="text--center">No match history found.</p>
        </div>
      </div>
    </div>
  `;

  return {
    template,
    bindEvents,
  };
}
