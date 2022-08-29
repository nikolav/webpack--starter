// lightweight dom shortcuts and helpers
import q from "nikolav-q";
import Modal from "./Modal/Modal";
//
import {
  chartDonut,
  classAdd,
  classRemove,
  ColorMode,
  download,
  eventListener,
  identity,
  // map,
  moneyFormat,
  moneyFormatDollar,
} from "../util";

// standard 20% retail rates
const TAX = 0.2;
// tax(gross)
const RATE = 0.166667;
// net <-> gross coef.
const RATE_GROSS = 1.2;

const MONTHSINYEAR = 12;
const WEEKS2INYEAR = 26.0893;
const WEEKSINYEAR = 52.1786;

const INCOME_ANNUAL = "@8";
const INCOME_FORTNIGHT = "@6";
const INCOME_MONTH = "@7";
const INCOME_WEEK = "@5";
const PAGE_INCOME = "@1";
const PAGE_INCOME_DETAILS = "@2";
const PAGE_VISUALIZE = "@9";
const REPORT_GROSS = "@3";
const REPORT_NET = "@4";

const incomePeriods = {
  [INCOME_WEEK]: "Weekly",
  [INCOME_FORTNIGHT]: "Fortnightly",
  [INCOME_MONTH]: "Monthly",
  [INCOME_ANNUAL]: "Annualy",
};

const calcAnnualByPeriod = {
  [INCOME_WEEK]: (income) => WEEKSINYEAR * income,
  [INCOME_FORTNIGHT]: (income) => WEEKS2INYEAR * income,
  [INCOME_MONTH]: (income) => MONTHSINYEAR * income,
  [INCOME_ANNUAL]: (income) => income,
};

const calcIncomeByPeriod = {
  [INCOME_WEEK]: (g, format = identity) => ({
    fq: incomePeriods[INCOME_WEEK],
    tax: format(parseInt((g / WEEKSINYEAR) * RATE, 10)),
    net: format(parseInt(g / WEEKSINYEAR / RATE_GROSS, 10)),
    gross: format(parseInt(g / WEEKSINYEAR, 10)),
  }),
  [INCOME_FORTNIGHT]: (g, format = identity) => ({
    fq: incomePeriods[INCOME_FORTNIGHT],
    tax: format(parseInt((g / WEEKS2INYEAR) * RATE, 10)),
    net: format(parseInt(g / WEEKS2INYEAR / RATE_GROSS, 10)),
    gross: format(parseInt(g / WEEKS2INYEAR, 10)),
  }),
  [INCOME_MONTH]: (g, format = identity) => ({
    fq: incomePeriods[INCOME_MONTH],
    tax: format(parseInt((g / MONTHSINYEAR) * RATE, 10)),
    net: format(parseInt(g / MONTHSINYEAR / RATE_GROSS, 10)),
    gross: format(parseInt(g / MONTHSINYEAR, 10)),
  }),
  [INCOME_ANNUAL]: (g, format = identity) => ({
    fq: incomePeriods[INCOME_ANNUAL],
    tax: format(parseInt(g * RATE, 10)),
    net: format(parseInt(g / RATE_GROSS, 10)),
    gross: format(parseInt(g, 10)),
  }),
};

const APP_GITHUB = "https://github.com/nikolav/webpack--starter";
const API_PDFREPORT_DL = "https://qyhnjtvrhog.herokuapp.com/api/ijlwydmfdeo";

// init colormode switch @this cx
const cxDark = 16;
const cxLight = 48;

export default class App {
  // state:
  //   active             : string;
  //   activeReport       : string;
  //   incomePeriod       : string;
  //   incomePeriodSelect : string;
  //   isActiveMenu       : boolean;
  //   isActiveMenu2      : boolean;
  //   income             : number;

  state = null;

  root = null;

  e = null;

  colormode = null;

  _cx = cxLight;

  constructor(node) {
    //
    this.root = node;
    // dispatcher
    this.e = eventListener();
    // @mount-start
    this.e.addEventListener("render", this.render.bind(this));
    // trigger to access dom @mount-end
    this.e.addEventListener("render--done", this.onRender.bind(this));
    // @init
    this.setState({
      active: PAGE_INCOME_DETAILS,
      activeReport: null,
      incomePeriod: INCOME_MONTH,
      incomePeriodSelect: INCOME_MONTH,
      isActiveMenu: null,
      isActiveMenu2: null,
      income: 0,
      isDownloadingPdf: null,
      _forceRender: null,
    });
    // init colormode service
    this.colormode = new ColorMode();
    this.colormode.onColorModeChange((isDark) => {
      const thumb = q.s("#switch--color-mode");
      if (isDark) {
        classRemove(thumb, "switchOff");
        classAdd(thumb, "switchOn");
        // set initial cx.pos for colormode switch
        // ..prevents switch animation @navigation
        this._cx = cxDark;
      } else {
        classRemove(thumb, "switchOn");
        classAdd(thumb, "switchOff");
        //
        this._cx = cxLight;
      }
      // re-render chart if @page.vis
      //  ..redraw with new colors
      if (PAGE_VISUALIZE === this.state.active) this.forceRender();
    });
    // trigger .onColorModeChange @mount to setup thumb .cx
    if (this.colormode.isDark()) this.colormode.setDark();
  }

  render() {
    const page = this.state.active;
    this.root.innerHTML = `

        <!-- @app; bg neutral, text color washed-out, center child node -->
        <main id="app" class="bg-stone-50/50 text-slate-600 h-screen lg:w-screen flex items-center justify-center dark:bg-black dark:text-slate-200 sm:pt-4">

        <!-- @window; centered, 856x640 -->
        <section id="window" class="relative w-[856px] h-[640px]">

          <!-- @tabs.left -->
          <ul id="#tabs" class="text-xs sm:text-base absolute -translate-y-[100%]  space-x-2 flex list-none lg:top-0 lg:left-0 lg:-rotate-90 lg:-translate-x-[291px] lg:translate-y-[250px]">

            <!-- @tabs.vis -->
            <li id="tab-vis" class="tabs-left order-3 lg:order-1 ${
              PAGE_VISUALIZE === page
                ? "bg-green-200 text-green-800 border-green-800 dark:bg-stone-900/80 dark:text-slate-200 dark:border-white"
                : "dark:border-0"
            }">Visualize</li>

            <!-- @tabs.income -->
            <li id="tab-income" class="tabs-left order-2 !mr-2 lg:mr-0 ${
              PAGE_INCOME === page
                ? "bg-green-200 text-green-800 border-green-800 dark:bg-stone-900/80 dark:text-slate-200 dark:border-white"
                : "dark:border-0"
            }">Income</li>

            <!-- @tabs.details -->
            <li id="tab-details" class="tabs-left order-1 lg:order-3 ${
              PAGE_INCOME_DETAILS === page
                ? "bg-green-200 text-green-800 border-green-800 dark:bg-stone-900/80 dark:text-slate-200 dark:border-white"
                : "dark:border-0"
            }">Income Details</li>
          </ul>

          <!-- @page -->
          <div id="#page" class="lg:absolute lg:inset-0 px-12 pt-4 h-full rounded-lg !rounded-tl-none shadow sm:border-r-4 border-green-500 dark:border-stone-800">
            
            <!-- @page.title -->
            <h1 class="text-sm sm:text-xl md:text-2xl lg:text-4xl flex items-center justify-end sm:justify-start md:space-x-8">

              <!-- @page.icon-calculcator -->
              <strong class="shrink-0 text-stone-500 hidden md:!inline-block scale-75 lg:scale-100">${this.iconCalculator()}</strong>
              
              <!-- @page.title-text -->
              <span class="pt-2 opacity-90 grow inline-block">Income tax calcualtor</span>

              <!-- @button.download @page.details -->
              ${
                PAGE_INCOME === page
                  ? this.state.isDownloadingPdf
                    ? `<strong class="scale-75 lg:scale-100 opacity-30 flex items-center justify-center gap-3 my-2">
                      <span class="text-green-800/80 dark:text-white">${this.iconSpinner(
                        32
                      )}</span> 
                      <span class="text-sm pt-1 inline-block">Processing...</span>
                    </strong>`
                    : `<button id="pdf-report" class="scale-75 lg:scale-100 inline-flex items-center justify-center space-x-2 min-w-[145px] border-2 border-stone-300 hover:bg-stone-50 text-lg rounded-lg py-2 shadow-sm opacity-80 hover:opacity-100 dark:border-stone-800 dark:text-stone-500 dark:hover:bg-stone-800/80 dark:hover:text-white/50">
                    ${this.iconDownload()}
                    <span>Download</span>
                  </button>`
                  : ""
              }

              <span class="inline-flex items-center gap-6 lg:absolute lg:top-0 lg:right-4 lg:-translate-y-[115%] scale-75 md:scale-90 lg:scale-100">                
                
                <!-- @link.github @page* -->
                <a class="text-stone-500 cursor-pointer transition-transform inline-block opacity-30 hover:opacity-100 hover:scale-110 dark:hover:text-white" rel="noopener norefferer" target="_blank" href="${APP_GITHUB}">
                  ${this.iconGithubAlt()}
                </a>

                <button id="color-mode" class="opacity-60 hover:opacity-80 text-xs inline-block">
                  ${this.iconColorModeToggle(this._cx)}
                </button>

              </span>

            </h1>

            <!-- @page router, render page 'component' according to PAGE_.. state -->
            <div id="page-active" class=${
              PAGE_INCOME === page ? "**mt-4" : "mt-12 sm:mt-16"
            }>
              ${((app) => {
                switch (true) {
                  case PAGE_INCOME === page:
                    return app.pageIncome();
                  case PAGE_VISUALIZE === page:
                    return app.pageVisualize();
                  default:
                    return app.pageIncomeDetails();
                }
              })(this)}
            </div>
          </div>
        </section>
      </main>
        `;
    // attach events
    this.listenEvents(page);
    // trigger mount--done
    this.e.triggerEvent("render--done", page);
    //
  }

  pageIncomeDetails() {
    const report = this.state.activeReport;
    return `

      <!-- @controll, total income -->
      <div id="input-controll">
        <h4 class="text-sm sm:text-xl md:text-2xl opacity-80 ml-4">
          What is your total income?
        </h4>
        
        <!-- input income .div -->
        <div class="mt-4 focus-within:border-green-200 focus-within:ring focus-within:ring-green-200 dark:focus-within:ring-stone-800/40 focus-within:ring-opacity-50 overflow-hidden flex border-slate-300 border-[1px] dark:border-stone-800/90 rounded-md shadow-sm"> 
        
          <!-- @input -->
          <input id="input-income" type="number" value="${
            this.state.income
          }" class="input-noborder grow pl-12 text-2xl autofocus autocomplete="off"/>

          <!-- @button -->
          <button id="button-01" class="flex justify-between items-center gap-1 py-3 pl-4 sm:pl-8 pr-2 sm:pr-6 font-bold self-stretch sm:min-w-[196px] text-sm sm:text-lg hover:bg-green-200 active:bg-green-800 active:text-white border-l-[1px] border-slate-300 dark:border-stone-800/90 dark:hover:bg-stone-800/20 dark:active:text-black dark:active:bg-white">

            <!-- @button.text -->
            <span>${incomePeriods[this.state.incomePeriod]}</span>

            <!-- @button.icon chevron-down -->
            <span class="opacity-50 scale-50 sm:scale-100">${this.iconChevronDown()}</span>
            
          </button>
        </div>
      </div>
      
      <!-- @report-type buttons -->
      <div class="mt-16">

        <h4 class="text-sm sm:text-2xl opacity-80 ml-4">Please choose the income type:</h4>

        <!-- @buttons grid -->
        <div class="space-y-1 sm:space-y-0 sm:grid sm:grid-cols-[44%_1fr] sm:gap-[.4rem] font-bold mt-6">

          <!-- @button .gross-income -->
          <button id="button-income-gross" class="button-report-type rounded-t-lg sm:rounded-tl-lg sm:rounded-tr-none order-1 ${
            report === REPORT_GROSS
              ? "bg-green-200 text-green-800 !border-green-800 dark:!border-stone-600 dark:text-slate-200 dark:bg-stone-800/80"
              : ""
          }">
            Gross Income
          </button>

          <!-- @button .net-income -->
          <button id="button-income-net" class="button-report-type sm:rounded-bl-lg order-3 ${
            report === REPORT_NET
              ? "bg-green-200 text-green-800 !border-green-800 dark:!border-stone-600 dark:text-slate-200 dark:bg-stone-800/80"
              : ""
          }">
            Net Income
          </button>

          <!-- @button .calculate -->
          <button id="button-calculate" class="block w-full transition-colors rounded-b-lg sm:rounded-r-lg sm:rounded-bl-none border-[1px] shadow-sm border-stone-600 py-4 tracking-wider text-3xl sm:text-4xl row-span-2 order-2 ${
            null != report
              ? "bg-green-200 text-green-800 !border-green-800 opacity-80 hover:opacity-90 active:opacity-100 dark:!border-stone-600 dark:bg-stone-800/80 dark:text-white"
              : "opacity-30 cursor-not-allowed"
          }">

            <!-- @calculate icon -->
            <strong class="hidden sm:!inline-block opacity-80 mr-2">
              ${this.iconCalculator(52)}
            </strong>
            <span>Calculate</span>
          </button>

        </div>

      </div>

    <!-- @overlay.fixed, render menu -->
    ${this.state.isActiveMenu ? this.menuSelectIncomeType() : ""}
    `;
  }

  pageIncome() {
    return `
      
      <!-- @table.bg -->
      <section class="bg-green-200 p-4 rounded-md dark:bg-black">
        
      <!-- @table.head -->
      <div class="flex items-center text-base md:text-xl lg:text-2xl">
        
        <!-- @table.head info button-->
        <span class="inline-flex items-center justify-between md:min-w-[192px] lg:min-w-[256px] p-4 pr-6 rounded-lg bg-green-600 shadow-md shadow-green-800/40 text-white text-base md:text-2xl lg:text-4xl dark:bg-stone-800 dark:shadow-stone-800/80 dark:shadow-sm">
          ${((app) => {
            const income = app.state.income;
            const isNet = REPORT_NET === app.state.activeReport;
            const incomeGross = isNet ? TAX * income + income : income;
            const incomeGrossAnnual =
              calcAnnualByPeriod[app.state.incomePeriod](incomeGross);
            const yourIncome =
              calcIncomeByPeriod[app.state.incomePeriodSelect](
                incomeGrossAnnual
              )[isNet ? "net" : "gross"];
            //
            return `<span class="opacity-40 text-2xl">$</span> <strong class="ml-4 inline-block">${moneyFormat(
              yourIncome
            )}</strong>`;
          })(this)}
        </span>
        
        <!-- @table.head income type -->
        <span class="inline-block ml-6">
          your 
          <strong>${
            REPORT_GROSS === this.state.activeReport ? "gross" : "net"
          }</strong>
        </span>
        
        <!-- @button.select -->
        <button id="button-02" class="opacity-80 lg:min-w-[105px] flex items-center md:justify-between bg-none lowercase underline underline-offset-4 mx-2">
          
          ${incomePeriods[this.state.incomePeriodSelect]}
          <span class="scale-50">${this.iconChevronDown()}</span>
        </button>

        <span>income.</span>
      </div>

      <!-- @table -->
      <div class="bg-white p-4 pb-1 shadow rounded mt-4 dark:bg-gradient-to-b dark:from-stone-900/95 dark:to-stone-900 text-xs sm:text-sm md:text-base">
        <ul class="list-none font-bold">

          <!-- @table .th -->
          <li class="flex border-b-2 border-slate-200 pb-4 px-4 dark:border-stone-600">
            ${["Frequency", "Gross Income", "Tax", "Net Income"]
              .map(
                (field) =>
                  `<div class="flex-1 tracking-wider opacity-60 italic">${field}</div>`
              )
              .join("")}
          </li>

          <!-- @table .tbody -->
          ${this.calculation({
            fq: this.state.incomePeriod,
            reportType: this.state.activeReport,
            income: this.state.income,
          })
            .map(
              (
                node
              ) => `<li class="flex border-b-[1px] last:border-b-0 border-slate-200 px-4 py-4 hover:bg-green-200/20 hover:text-green-500 dark:border-stone-600 dark:hover:bg-black/20 dark:text-white/40 dark:hover:text-white">
              ${[node.fq, node.gross, node.tax, node.net]
                .map(
                  (field) =>
                    `<div class="flex-1">${
                      -1 !==
                      ["Weekly", "Fortnightly", "Monthly", "Annualy"].indexOf(
                        field
                      )
                        ? field
                        : `<span class="opacity-20">$ </span> ${moneyFormat(
                            field
                          )}`
                    }</div>`
                )
                .join("")}
            </li>`
            )
            .join("")}
        </ul>

      </div>

      </section>

      ${this.incomeAlertSection()}

      <!-- @overlay.fixed, render menu -->
      ${this.state.isActiveMenu2 ? this.menuSelectIncomeType_menu2() : ""}  
    `;
  }

  pageVisualize() {
    return `
      <!-- @page.vis--container -->
      <div class="mt-12">
        
      <!-- @chart.layout, 2cols, left fit, right stretch -->
        <section id="chart--container" class="sm:grid sm:grid-cols-[auto_1fr]">
          
          <!-- @chart.root svg renders here -->
          <div id="chart--root" class="flex justify-center"></div>
            
            <!-- @legend.spacing, left align, spacing wide -->
            <div id="chart--legend" class="flex flex-col items-start gap-8 mt-8 ml-8 sm:ml-12 sm:mt-12">
              
              <!-- @legend.net, green dot, label.net -->
              <div>
                <svg 
                  width="24" 
                  height="24" 
                  viewBox="0 0 100 100" 
                  class="inline-block">
                  <circle 
                    cx="50" 
                    cy="50" 
                    r="44"
                    fill=${this.colormode.isDark() ? "#292524" : "#86efac"}
                    stroke=${this.colormode.isDark() ? "#57534e" : "#14532d"}
                    stroke-width="8"
                  /> 
                    <span class="text-sm inline-block ml-4 font-bold sm:text-md md:text-lg lg:text-2xl">Your Net Income</span>
                </svg>
              </div>

              <!-- @legend.tax, orange dot, label.tax -->
              <div>
                <svg 
                  width="24" 
                  height="24" 
                  viewBox="0 0 100 100" 
                  class="inline-block">
                  <circle 
                    cx="50" 
                    cy="50" 
                    r="44"
                    fill=${this.colormode.isDark() ? "#737373" : "#fdba74"}
                    stroke=${this.colormode.isDark() ? "#a3a3a3" : "#7c2d12"}
                    stroke-width="8"
                  /> 
                    <span class="text-sm inline-block ml-4 font-bold sm:text-md md:text-lg lg:text-2xl">Your Tax</span>
                </svg>
              </div>
            </div>
        </section>
        
        <!-- @alert message visualize, render 1st class @admin.me content here 😎  -->
        <section class="mt-14">
          ${this.visualizeAlertSection()}
        </section>
      </div>
    `;
  }

  onRender(page) {
    if (page === PAGE_VISUALIZE) {
      const { tax, net } = this.calculation({
        fq: this.state.incomePeriod,
        reportType: this.state.activeReport,
        income: this.state.income,
      }).pop();

      // render chart
      chartDonut({
        root: q.s("#chart--root"),
        data: [
          {
            key: "tax",
            value: tax,
          },
          {
            key: "net",
            value: net,
          },
        ],
        options: {
          colors: this.colormode.isDark()
            ? ["#44403c", "#292524"]
            : ["#fdba74", "#86efac"],
          _stroke: this.colormode.isDark() ? "#78716c" : "#14532d",
        },
      });
    }
    //
  }

  incomeAlertSection() {
    return `
      <div class="hidden sm:!block">
      <!-- wrapper; flex bg-orange -->
      <section class="px-8 rounded-md mt-4 min-h-[96px] flex border-r-4 border-orange-300 items-center justify-between bg-[#eedec1]/40 shadow shadow-orange-300/40 dark:border-stone-800/80 dark:shadow-none dark:bg-black">

        <!-- @icon temple -->
        <div id="income-alert--icon" class="hidden md:!block">
          <strong class="inline-flex items-center gap-0">

            <!-- @icon left -->
            <span class="text-[#f4bb27] opacity-40 -translate-y-[4px] dark:text-stone-800">
              ${this.iconTemple(18)}
            </span>
            
            <!-- @icon middle -->
            <span class="text-[#f4bb27] opacity-80 dark:text-stone-800">
              ${this.iconTemple(42)}
            </span>
            
            <!-- @icon right -->
            <span class="text-[#f4bb27] opacity-60 dark:text-stone-800">
              ${this.iconTemple(22)}
            </span>

          </strong>
        </div>

        <!-- @text -->
        <div class="grow text-center" id="income-alert--message">
          <p class="text-sm md:text-lg text-orange-900/70 font-bold dark:text-stone-400/60">Compare lenders and get your finance.</p>
        </div>

        <!-- @button.apply-now -->
        <div id="income-alert--action">
          <button id="action--apply-now" class="shadow min-w-[156px] p-2 px-4 bg-gradient-to-b from-green-600/80  to-green-600 hover:bg-green-600 border-[2px] border-green-600 rounded-md text-white/90 hover:text-white text-lg font-bold hover:ring-[2px] ring-green-300 active:!bg-green-900 active:text-white active:ring-green-500 dark:from-stone-900/90 dark:to-stone-900 dark:border-stone-600/20 dark:text-white/70 dark:hover:text-white/90 dark:active:text-white dark:hover:ring-stone-600 dark:hover:bg-stone-900 dark:active:!bg-stone-600">Apply now</button>
        </div>
      </section>
      </div>
    `;
  }

  visualizeAlertSection() {
    return `
      <div class="hidden sm:!block">
        <!-- wrapper; flex bg-orange -->
        <section class="px-8 rounded-md mt-4 min-h-[96px] flex border-r-4 border-orange-300 items-center justify-between bg-[#eedec1]/40 shadow shadow-orange-300/40 dark:border-stone-800/80 dark:shadow-none dark:bg-black">

          <!-- @icons nerd-face strong -->
          <div id="vis-alert--icon" class="hidden md:!inline-block">
            <strong class="inline-flex items-center gap-0">

              <!-- @icon.win glasses strong -->
              <span class="text-4xl">
                🤓💪🏼
              </span>

            </strong>
          </div>

          <!-- @alert.text -->
          <div class="grow text-center" id="vis-alert--message">
            <p class="text-sm md:text-lg text-orange-900/70 font-bold dark:text-stone-400/60">The Best ReactJS Components Online!</p>
          </div>

          <!-- @button.learn-more -->
          <div id="vis-alert--action">
            <a rel="norefferer noopener" target="_blank" href="https://sheltered-brook-37083.herokuapp.com/accordion" class="flex justify-between items-center shadow min-w-[156px] p-2 px-4 bg-gradient-to-b from-green-600/80  to-green-600 hover:bg-green-600 border-[2px] border-green-600 rounded-md text-white/90 hover:text-white text-sm md:text-md lg:text-lg font-bold hover:ring-[2px] ring-green-300 active:!bg-green-900 active:text-white active:ring-green-500 dark:from-stone-900/90 dark:to-stone-900 dark:border-stone-600/20 dark:text-white/70 dark:hover:text-white/90 dark:active:text-white dark:hover:ring-stone-600 dark:hover:bg-stone-900 dark:active:!bg-stone-600">
              <span>Look around</span>
              <span class="opacity-40 ml-2">${this.iconLinkExternal()}</span>
            </a>
          </div>
        </section>
      </div>
    `;
  }

  calculation(calc, format = identity) {
    const { fq, reportType, income } = calc;

    const incomeBase =
      reportType === REPORT_NET ? TAX * income + income : income;

    const grossAnnual = calcAnnualByPeriod[fq](incomeBase);

    return [INCOME_WEEK, INCOME_FORTNIGHT, INCOME_MONTH, INCOME_ANNUAL].map(
      (f) => calcIncomeByPeriod[f](grossAnnual, format)
    );
  }

  menuSelectIncomeType() {
    const { top, height, right, width } = q
      .s("#button-01")
      .getBoundingClientRect();
    const { incomePeriod } = this.state;
    //
    return `

      <!-- menu container -->
      <div id="menu-01" style="top: ${parseInt(
        top + height + 2 + 16,
        10
      )}px; left: ${parseInt(
      right + 2 - 256,
      10
    )}px; transform: translateX(${parseInt(
      (256 - width) / 2,
      10
    )}px)" class="fixed w-[256px] h-64 z-[1] rounded-lg border-[1px] border-slate-300 dark:border-stone-700">

      <!-- @menu.arrow-up -->
      <div class="absolute top-0 left-[59%] sm:left-[71%] -translate-y-[44%] rotate-45 p-2 border-[1px] border-slate-300 bg-white rounded-[4px] dark:border-stone-700 dark:bg-stone-900"></div>

      <!-- @menu -->
      <div class="absolute w-full h-full bg-white rounded-lg shadow-md text-lg overflow-hidden dark:bg-stone-900">
        <ul class="h-full list-none space-y-4 flex flex-col items-center">
          ${[
            {
              id: "option-week",
              type: INCOME_WEEK,
              text: "Weekly",
              classes: "pt-3",
            },
            {
              id: "option-fortnight",
              type: INCOME_FORTNIGHT,
              text: "Fortnightly",
              classes: "",
            },
            {
              id: "option-month",
              type: INCOME_MONTH,
              text: "Monthly",
              classes: "",
            },
            {
              id: "option-annual",
              type: INCOME_ANNUAL,
              text: "Annualy",
              classes: "pb-3",
            },
          ]
            .map(
              (node) =>
                `<li id="${node.id}" class="menu-option ${node.classes} ${
                  node.type === incomePeriod
                    ? "text-green-500 font-bold dark:text-white"
                    : "dark:text-white/20 dark:hover:text-white/50"
                }">${node.text}</li>`
            )
            .join("")}
        </ul>
      </div>
      </div>
    `;
  }

  menuSelectIncomeType_menu2() {
    const { top, height, right, width } = q
      .s("#button-02")
      .getBoundingClientRect();
    const { incomePeriodSelect } = this.state;
    //
    return `
      
      <div id="menu-02" style="top: ${parseInt(
        top + height + 2 + 16,
        10
      )}px; left: ${parseInt(
      right + 2 - 256,
      10
    )}px; transform: translateX(${parseInt(
      (256 - width) / 2,
      10
    )}px)" class="fixed w-[256px] h-64 z-[1] rounded-lg border-[1px] border-slate-300 dark:border-stone-700">

      <!-- @menu.arrow-up -->
      <div class="absolute top-0 left-[44%] -translate-y-[44%] rotate-45 p-2 border-[1px] border-slate-300 bg-white rounded-[4px] dark:border-stone-700 dark:bg-stone-900"></div>

      <!-- @menu -->
      <div class="absolute w-full h-full bg-white rounded-lg shadow-md text-lg overflow-hidden dark:bg-stone-900">
        <ul class="h-full list-none space-y-4 flex flex-col items-center">
        ${[
          {
            id: "option-week-menu2",
            type: INCOME_WEEK,
            text: "Weekly",
            classes: "pt-3",
          },
          {
            id: "option-fortnight-menu2",
            type: INCOME_FORTNIGHT,
            text: "Fortnightly",
            classes: "",
          },
          {
            id: "option-month-menu2",
            type: INCOME_MONTH,
            text: "Monthly",
            classes: "",
          },
          {
            id: "option-annual-menu2",
            type: INCOME_ANNUAL,
            text: "Annualy",
            classes: "pb-3",
          },
        ]
          .map(
            (node) =>
              `<li id="${node.id}" class="menu-option ${node.classes} ${
                node.type === incomePeriodSelect
                  ? "text-green-500 font-bold dark:text-white"
                  : "dark:text-white/20 dark:hover:text-white/50"
              }">${node.text}</li>`
          )
          .join("")}
        </ul>
      </div>
      </div>
    `;
  }

  // https://react-icons.github.io/react-icons/
  iconCalculator(size = 64) {
    return `
      <svg xmlns="http://www.w3.org/2000/svg" class="opacity-20 inline-block icon icon-tabler icon-tabler-calculator" width="${size}" height="${size}" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" fill="none" stroke-linecap="round" stroke-linejoin="round">
        <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
        <rect x="4" y="3" width="16" height="18" rx="2" />
        <rect x="8" y="7" width="8" height="3" rx="1" />
        <line x1="8" y1="14" x2="8" y2="14.01" />
        <line x1="12" y1="14" x2="12" y2="14.01" />
        <line x1="16" y1="14" x2="16" y2="14.01" />
        <line x1="8" y1="17" x2="8" y2="17.01" />
        <line x1="12" y1="17" x2="12" y2="17.01" />
        <line x1="16" y1="17" x2="16" y2="17.01" />
      </svg>  
    `;
  }

  iconChevronDown() {
    return `
    <svg width="20" height="20" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512"><path d="M224 416c-8.188 0-16.38-3.125-22.62-9.375l-192-192c-12.5-12.5-12.5-32.75 0-45.25s32.75-12.5 45.25 0L224 338.8l169.4-169.4c12.5-12.5 32.75-12.5 45.25 0s12.5 32.75 0 45.25l-192 192C240.4 412.9 232.2 416 224 416z" fill="currentcolor"/></svg>
    `;
  }

  iconDownload() {
    return `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="16" height="16">
      <path d="M480 352h-133.5l-45.25 45.25C289.2 409.3 273.1 416 256 416s-33.16-6.656-45.25-18.75L165.5 352H32c-17.67 0-32 14.33-32 32v96c0 17.67 14.33 32 32 32h448c17.67 0 32-14.33 32-32v-96C512 366.3 497.7 352 480 352zM432 456c-13.2 0-24-10.8-24-24c0-13.2 10.8-24 24-24s24 10.8 24 24C456 445.2 445.2 456 432 456zM233.4 374.6C239.6 380.9 247.8 384 256 384s16.38-3.125 22.62-9.375l128-128c12.49-12.5 12.49-32.75 0-45.25c-12.5-12.5-32.76-12.5-45.25 0L288 274.8V32c0-17.67-14.33-32-32-32C238.3 0 224 14.33 224 32v242.8L150.6 201.4c-12.49-12.5-32.75-12.5-45.25 0c-12.49 12.5-12.49 32.75 0 45.25L233.4 374.6z" fill="currentcolor" fill-opacity=".55"/>
    </svg>
    `;
  }

  iconTemple(size = 12) {
    return `
    <svg width="${size}" height="${size}" version="1.1" viewBox="0 0 216.74 224.35" xmlns="http://www.w3.org/2000/svg"><g transform="translate(-44.42 -21.87)"><path d="m50.062 244.26c-7.415-4.3545-7.5619-29.422-0.19885-33.937 4.2617-2.6133 202.64-2.1325 206.28 0.49996 5.6377 4.0763 6.5078 25.096 1.2948 31.276-3.2228 3.8206-201.04 5.8824-207.37 2.1614zm26.168-45.486c-3.4464-1.184-7.5725-6.8128-8.7298-11.909-1.8606-8.1937-0.73317-83.868 1.3109-87.995 5.9296-11.97 21.547-11.368 26.958 1.038 2.4941 5.7194 1.4249 88.462-1.1995 92.825-3.5967 5.9801-11.213 8.489-18.339 6.041zm70.85-2.9957c-3.4336-1.1802-8.5084-7.8865-9.1581-12.102-1.5314-9.9375-0.0282-85.631 1.7572-88.488 6.7564-10.808 19.23-10.808 25.987 0 1.7855 2.8563 3.2886 78.55 1.7572 88.488-1.4481 9.3968-11.25 15.228-20.343 12.102zm73.723 0.0997c-3.6276-1.2967-7.0918-4.6876-8.5746-8.393-2.2967-5.7394-2.0408-86.136 0.29145-91.558 5.9441-13.817 24.905-10.746 27.891 4.5165 1.1246 5.7503 1.0133 79.003-0.12749 83.876-2.1389 9.136-11.206 14.516-19.48 11.559zm-172.49-122.04c-4.0707-1.9529-4.5746-9.5294-0.82304-12.377 1.9239-1.4601 103.22-39.595 105.17-39.595 1.0016 0 17.693 6.1585 80.125 29.564 28.774 10.787 31.463 12.897 26.22 20.575-1.7043 2.496-205.61 4.2698-210.69 1.8328z" fill="currentcolor"/></g></svg>
    `;
  }

  iconLinkExternal(size = 24) {
    return `
    <svg width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" aria-hidden="true">
      <path stroke-linecap="round" stroke-linejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"/>
    </svg>
    `;
  }

  iconGithubAlt(size = 32) {
    return `
    <svg width="${size}" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 480 512">
      <path d="M186.1 328.7c0 20.9-10.9 55.1-36.7 55.1s-36.7-34.2-36.7-55.1 10.9-55.1 36.7-55.1 36.7 34.2 36.7 55.1zM480 278.2c0 31.9-3.2 65.7-17.5 95-37.9 76.6-142.1 74.8-216.7 74.8-75.8 0-186.2 2.7-225.6-74.8-14.6-29-20.2-63.1-20.2-95 0-41.9 13.9-81.5 41.5-113.6-5.2-15.8-7.7-32.4-7.7-48.8 0-21.5 4.9-32.3 14.6-51.8 45.3 0 74.3 9 108.8 36 29-6.9 58.8-10 88.7-10 27 0 54.2 2.9 80.4 9.2 34-26.7 63-35.2 107.8-35.2 9.8 19.5 14.6 30.3 14.6 51.8 0 16.4-2.6 32.7-7.7 48.2 27.5 32.4 39 72.3 39 114.2zm-64.3 50.5c0-43.9-26.7-82.6-73.5-82.6-18.9 0-37 3.4-56 6-14.9 2.3-29.8 3.2-45.1 3.2-15.2 0-30.1-.9-45.1-3.2-18.7-2.6-37-6-56-6-46.8 0-73.5 38.7-73.5 82.6 0 87.8 80.4 101.3 150.4 101.3h48.2c70.3 0 150.6-13.4 150.6-101.3zm-82.6-55.1c-25.8 0-36.7 34.2-36.7 55.1s10.9 55.1 36.7 55.1 36.7-34.2 36.7-55.1-10.9-55.1-36.7-55.1z" fill="currentcolor"/>
    </svg>
    `;
  }

  iconSpinner(size = 64) {
    return `
    
    <!-- 2beems fast green -->
    <svg class="spinner1" width="${size}" height="${size}" viewBox="0 0 64 64">

      <!-- bg track -->
      <circle
        cx="32"
        cy="32"
        r="27"
        fill="none"
        stroke="currentcolor"
        stroke-opacity=".122"
        stroke-width="10"
      />

      <!-- spinner -->
      <circle
        cx="32"
        cy="32"
        r="27"
        fill="none"
        stroke="currentcolor"
        stroke-width="10"
        stroke-dasharray="42.4115"
        stroke-linecap="round"
      />
  </svg>
    `;
  }

  // @todo
  // https://codesandbox.io/s/intelligent-galileo-mlh9py?file=/index.html:546-911
  iconColorModeToggle(cx = 48) {
    return `

    <svg
      class="switchModeToggle--canvas"
      width="64"
      height="32"
      viewBox="0 0 64 32">

      <line
        class="switchModeToggle--track"
        x1="16"
        y1="16"
        x2="48"
        y2="16"
        stroke="currentcolor"
        stroke-width="32"
        stroke-opacity=".22"
        stroke-linecap="round"
      />

      <text 
        x="4" y="23"
        style="font-size: 20px; opacity: .45"
      >🌜</text>

      <text 
        x="32" y="23"
        style="font-size: 20px; opacity: .45"
      >🌞</text>

      <circle
        id="switch--color-mode"
        class="switchModeToggle--thumb"
        cx="${cx}"
        cy="16"
        r="14"
        fill="currentcolor"
      />
    </svg>
    `;
  }

  iconCircleCheck(size = 16) {
    return `
    <svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" fill="currentColor"  viewBox="0 0 16 16">
      <path d="M16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0zm-3.97-3.03a.75.75 0 0 0-1.08.022L7.477 9.417 5.384 7.323a.75.75 0 0 0-1.06 1.06L6.97 11.03a.75.75 0 0 0 1.079-.02l3.992-4.99a.75.75 0 0 0-.01-1.05z"/>
    </svg>
    `;
  }

  applyNow() {
    return `
      <div class="flex flex-col items-center p-4 text-slate-600 dark:text-white">
        <strong class="inline-block mt-12 text-green-500/60 dark:text-white/10">${this.iconCircleCheck(
          256
        )}</strong>
        <div class="text-2xl mt-16 text-center opacity-80 tracking-wider">
        <p>Your application is successfull.</p>
          <p>Thank you for using our services.</p>
          <p><a rel="noopener norefferer" target="_blank" href="https://sheltered-brook-37083.herokuapp.com/accordion" class="link text-green-500/80">Free ReactJS components...</a></p>

          <p class="mt-12 opacity-50 dark:opacity-20 text-sm">Congratulations!</p>
          <p class="opacity-50 dark:opacity-20 text-sm">You successfully formated your C: drive.</p>
        </div>
      </div>
    `;
  }

  setState(state = {}) {
    this.state = { ...(this.state || {}), ...state };
    this.e.triggerEvent("render");
  }

  forceRender() {
    this.setState({ _forceRender: Date.now() });
  }

  listenEvents(page) {
    const app = this;
    const report = app.state.activeReport;
    //
    // attach tab navigation events @all pages
    q.on({
      target: q.s("#tab-income"),
      run: () => app.setState({ active: PAGE_INCOME }),
    });
    q.on({
      target: q.s("#tab-details"),
      run: () => app.setState({ active: PAGE_INCOME_DETAILS }),
    });
    q.on({
      target: q.s("#tab-vis"),
      run: () => app.setState({ active: PAGE_VISUALIZE }),
    });

    if (PAGE_INCOME_DETAILS === page) {
      // listen income page events only
      q.on({
        target: q.s("#button-income-gross"),
        run: () =>
          app.setState({
            activeReport: REPORT_GROSS === report ? null : REPORT_GROSS,
          }),
      });
      q.on({
        target: q.s("#button-income-net"),
        run: () =>
          app.setState({
            activeReport: REPORT_NET === report ? null : REPORT_NET,
          }),
      });
      q.on({
        target: q.s("#button-01"),
        run: (e) => {
          // prevent docEl @this event
          //   ..otherwise menu gets turned off and on immediately
          e.stopPropagation();
          setTimeout(() =>
            app.setState({ isActiveMenu: !app.state.isActiveMenu })
          );
        },
      });

      if (app.state.isActiveMenu) {
        [
          {
            id: "#option-week",
            p: INCOME_WEEK,
          },
          {
            id: "#option-fortnight",
            p: INCOME_FORTNIGHT,
          },
          {
            id: "#option-month",
            p: INCOME_MONTH,
          },
          {
            id: "#option-annual",
            p: INCOME_ANNUAL,
          },
        ].forEach((node) =>
          q.on({
            target: q.s(node.id),
            run: () =>
              app.setState({
                incomePeriod: node.p,
                incomePeriodSelect: node.p,
                isActiveMenu: false,
              }),
          })
        );
      }

      q.on({
        type: "input",
        target: q.s("#input-income"),
        run: (e) => {
          app.state.income = parseInt(e.target.value, 10) || "";
        },
      });

      q.on({
        target: q.s("#button-calculate"),
        run: () => {
          if (app.state.activeReport && app.state.incomePeriod) {
            app.setState({ active: PAGE_INCOME });
          }
        },
      });
    }
    //
    if (PAGE_INCOME === page) {
      // init menu-2
      // @todo refactor repetition here
      q.on({
        target: q.s("#button-02"),
        run: (e) => {
          e.stopPropagation();
          setTimeout(() =>
            app.setState({ isActiveMenu2: !app.state.isActiveMenu2 })
          );
        },
      });
      if (app.state.isActiveMenu2) {
        [
          {
            id: "#option-week-menu2",
            p: INCOME_WEEK,
          },
          {
            id: "#option-fortnight-menu2",
            p: INCOME_FORTNIGHT,
          },
          {
            id: "#option-month-menu2",
            p: INCOME_MONTH,
          },
          {
            id: "#option-annual-menu2",
            p: INCOME_ANNUAL,
          },
        ].forEach((node) =>
          q.on({
            target: q.s(node.id),
            run: () =>
              app.setState({
                incomePeriodSelect: node.p,
                isActiveMenu2: false,
              }),
          })
        );
      }
      if (!app.state.isDownloadingPdf) {
        // POST https://qyhnjtvrhog.herokuapp.com/api/ijlwydmfdeo
        // post json calculation to php script @heroku
        // endpoint uses .dompdf plugin for laravel
        // https://github.com/barryvdh/laravel-dompdf
        // it loads .blade table template and generates pdf
        //
        // @routes/api.php
        //   Route::post("/ijlwydmfdeo", [PdfController::class, "download"]);
        // @Controller
        //   https://github.com/nikolav/basic-auth-laravel-auth-sanctum/blob/main/app/Http/Controllers/PdfController.php
        // @Blade
        //   https://github.com/nikolav/basic-auth-laravel-auth-sanctum/blob/f10f88f277f4e4c1b5878e25897dd3534a894e6a/resources/views/pdf/a4.blade.php#L357
        q.on({
          target: q.s("#pdf-report"),
          run: () => {
            app.setState({ isDownloadingPdf: true });
            fetch(API_PDFREPORT_DL, {
              method: "post",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                calculation: app.calculation(
                  {
                    fq: app.state.incomePeriod,
                    reportType: app.state.activeReport,
                    income: app.state.income,
                  },
                  moneyFormatDollar
                ),
              }),
            })
              .then((res) => res.blob())
              .then((d) =>
                // run download @next tick
                // ..service needs dom access
                // ..so wait sync stack to complete
                setTimeout(() =>
                  download(d, `calc.tax.${Date.now()}.pdf`, "application/pdf")
                )
              )
              .finally(() => {
                app.setState({ isDownloadingPdf: false });
              });
          },
        });
      }
      //
      q.on({
        target: q.s("#action--apply-now"),
        run: () => {
          const modal = new Modal();
          modal.open(app.applyNow());
        },
      });
    }
    //
    q.on({
      target: document.documentElement,
      run: ({ target }) => {
        const menu = q.s("#menu-01");
        if (app.state.isActiveMenu) {
          // is outside menu
          if (!menu?.contains(target)) {
            app.setState({ isActiveMenu: false });
          }
        }
      },
    });
    q.on({
      target: document.documentElement,
      run: ({ target }) => {
        const menu = q.s("#menu-02");
        if (app.state.isActiveMenu2) {
          if (!menu?.contains(target)) {
            app.setState({ isActiveMenu2: false });
          }
        }
      },
    });

    q.on({
      target: q.s("#color-mode"),
      run: () => app.colormode.toggle(),
    });
  }
}
