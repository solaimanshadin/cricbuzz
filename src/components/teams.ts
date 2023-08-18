import modal from "../lib/modal/index";
import toast from "../lib/toast/index";
import MatchHistory from "../model/MatchHistory";
import Team from "../model/Team";
import db from "../utils/db";
import { retrieveTeam } from "../utils/retrieveTeam";
import { rerenderRoute, router } from "../utils/router";

export default function teams(): Component {
  const teams = MatchHistory.getTeams();

  const bindEvents = (element: HTMLElement) => {
    const actionButtonList = element.querySelectorAll(
      ".team__action--edit"
    ) as NodeListOf<HTMLOrSVGImageElement>;

    actionButtonList.forEach((actionButtons) => {
      actionButtons.addEventListener("click", (event) => {
        event.stopPropagation();
        const target = event.target as HTMLOrSVGImageElement;
        modal(
          `
            <div class="form">
              <h4>Update team</h4>
              <div>
              <input type="text" name="teamName" id="teamNameInput" value="${target.dataset.name}" class="form-control" placeholder="Team 1" />

              <button id="confirmUpdateBtn" style="margin-top: 10px"  class="btn btn--primary"> Update </button>
              </div>
            </div>
          `,
          (element: HTMLElement, callback: Function) => {
            const target = event.target as HTMLElement;
            const confirmUpdateBtn = element.querySelector(
              "#confirmUpdateBtn"
            ) as HTMLButtonElement;

            let name: string = target.dataset.name || "";
            const inputRef = element.querySelector(
              "#teamNameInput"
            ) as HTMLInputElement;

            inputRef.addEventListener("change", (event: Event) => {
              name = (event.target as HTMLInputElement)?.value;
            });
            confirmUpdateBtn.addEventListener("click", () => {
              if (!name) {
                return toast(`Valid name required!`, {
                  type: "error",
                  timeOut: 1500,
                });
              }
              const teamInstance =
                target.dataset.name && retrieveTeam(target.dataset.name);
              teamInstance && teamInstance.updateTeamName(name);
              db.match.updateMany((document: MatchType) =>
                document.teamOne.name == target.dataset.name
                  ? { ...document, teamOne: { name } }
                  : document.teamTwo.name == target.dataset.name
                  ? { ...document, teamTwo: { name } }
                  : document
              );

              callback();
              rerenderRoute();
              toast("Team name updated!", {
                type: "success",
                timeOut: 1500,
              });
            });
          }
        );
      });
    });

    const deleteButtons = element.querySelectorAll(
      ".team__action--delete"
    ) as NodeListOf<HTMLOrSVGImageElement>;

    deleteButtons.forEach((deleteBtn) => {
      deleteBtn.addEventListener("click", (event: Event) => {
        event.stopPropagation();
        const target = event.target as HTMLElement;
        modal(
          `
            <div class="text--center">
              
              <p>Are you sure you want to delete this team? All the associated matches and players stats of this team will not be deleted</p>
              <button id="confirmDeleteBtn" style="margin-top: 10px"  class="btn btn--primary"> Ok </button>
              </div>
            </div>
          `,
          (element: HTMLElement, callback: Function) => {
            const confirmDeleteBtn = element.querySelector(
              "#confirmDeleteBtn"
            ) as HTMLButtonElement;

            confirmDeleteBtn.addEventListener("click", () => {
              const teamInstance =
                target.dataset.name && retrieveTeam(target.dataset.name);
              teamInstance && db.team.deleteOneById<TeamType>(teamInstance._id);

              callback();
              rerenderRoute();
              toast("Team deleted successfully!", {
                type: "success",
                timeOut: 1500,
              });
            });
          }
        );
      });
    });

    const teamCards = element.querySelectorAll(
      ".team__card"
    ) as NodeListOf<HTMLDivElement>;

    teamCards.forEach((teamCard: HTMLDivElement) => {
      teamCard.addEventListener("click", () => {
        teamCard.dataset.name &&
          router("#team-players", [teamCard.dataset.name]);
      });
    });

    const addTeamBtn = element.querySelector(
      ".btn--add-team"
    ) as HTMLButtonElement;

    addTeamBtn.addEventListener("click", () => {
      modal(
        `
          <div class="form">
            <h4>Create team</h4>
            <div>
            <input type="text" name="teamName" id="teamNameInput"  class="form-control" placeholder="Team one" />

            <button id="confirmSaveBtn" style="margin-top: 10px"  class="btn btn--primary"> Save </button>
            </div>
          </div>
        `,
        (element: HTMLElement, callback: Function) => {
          const confirmSaveBtn = element.querySelector("#confirmSaveBtn");
          let name: string = "";
          const inputRef = element.querySelector(
            "#teamNameInput"
          ) as HTMLInputElement;
          inputRef.addEventListener("change", (event) => {
            const target = event.target as HTMLInputElement;
            name = target.value;
          });
          confirmSaveBtn?.addEventListener("click", () => {
            if (!name) {
              return toast(`Valid name required!`, {
                type: "error",
                timeOut: 1500,
              });
            }
            const teamAlreadyExist = db.team
              .findAll<TeamType[]>()
              .find((team: TeamType) => team.name === name);
            if (teamAlreadyExist) {
              callback();
              return toast(`Team ${name} already exist`, {
                type: "warning",
                timeOut: 1500,
              });
            }
            new Team(name);
            callback();
            rerenderRoute();
            toast("Team added successfully!", {
              type: "success",
              timeOut: 1500,
            });
          });
        }
      );
    });
  };

  const template = `
    <div class="container">
      <div class="team box-shadow">
        <div class="team__header">
          <h3>Teams</h3>
          <button class="btn btn--primary btn--add-team">Add Team</button>
        </div>
        <div class="team__cards">
       
          <div bizFor="teams" class="team__card" data-name="{{name}}">
            <div class="team__team">
              <div>
                <span class="team__avatar">{{name}}</span>
                <span class="team__team--name">{{name}}</span>
              </div>
              <div>
              <span>Matches : {{matches}}</span>,
              <span>Win : {{win}}</span>,
              <span>Loss : {{loss}}</span>
              <svg data-name="{{name}}" xmlns="http://www.w3.org/2000/svg" class="team__action--edit" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path data-name="{{name}}" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>

              <svg data-name="{{name}}" xmlns="http://www.w3.org/2000/svg"  cursor: pointer" fill="none" viewBox="0 0 24 24" stroke="currentColor" class="team__action--delete">
                      <path data-name="{{team.name}}" strokelinecap="round" strokelinejoin="round" strokewidth="{2}" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                    </svg>
              
              </div>                
            </div>
          </div>
          <p bizIf="${
            teams.length == 0
          }" class="text--center">No teams found.</p>
        </div>
      </div>
    </div>
  `;

  return {
    template,
    bindEvents,
    exports: {
      teams,
    },
  };
}
