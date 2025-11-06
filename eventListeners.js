"use strict";

import { callToast, randInt, roundTo } from "./helper.js";
import { provinceData, otherData, otherDFData } from "./model.js";

//
export function addConstraints() {
  const expectedCashReplacement = document.getElementById(
    "expectedCash-replacement"
  );

  otherDFData.expectedCash = parseInt(expectedCashReplacement.innerText) || 0;

  function checkConstraint(currValue, stdVal, msg = "Không đủ kinh phí!") {
    if (currValue > stdVal || currValue < 0) {
      callToast(msg, "warning");
      return false;
    }
    return true;
  }

  //

  document
    .getElementById("purchase-vaccine")
    .addEventListener("change", (e) => {
      let currValue = parseInt(e.target.value) || 0;

      let costDiff =
        currValue * otherData.globalVaccinePrice -
        otherDFData.lastVaccineValue * otherData.globalVaccinePrice;

      if (
        checkConstraint(otherDFData.expectedCash + costDiff, otherData.cash) &&
        checkConstraint(
          currValue,
          otherData.numGlobalVaccine,
          "Quốc tế hiện không đủ vaccine!"
        )
      ) {
        otherDFData.expectedCash += costDiff;
        expectedCashReplacement.textContent = otherDFData.expectedCash;
        otherDFData.lastVaccineValue = currValue;
      } else {
        e.target.value = otherDFData.lastVaccineValue;
      }
    });

  //

  document
    .getElementById("social-investment")
    .addEventListener("change", (e) => {
      let currValue = parseInt(e.target.value) || 0;
      let diff = currValue - otherDFData.lastSocialValue;

      if (checkConstraint(otherDFData.expectedCash + diff, otherData.cash)) {
        otherDFData.expectedCash += diff;
        expectedCashReplacement.textContent = otherDFData.expectedCash;
        otherDFData.lastSocialValue = currValue;
      } else {
        e.target.value = otherDFData.lastSocialValue;
      }
    });

  //
  document
    .getElementById("science-investment")
    .addEventListener("change", (e) => {
      let currValue = parseInt(e.target.value) || 0;
      let diff = currValue - otherDFData.lastScienceValue;

      if (checkConstraint(otherDFData.expectedCash + diff, otherData.cash)) {
        otherDFData.expectedCash += diff;
        expectedCashReplacement.textContent = otherDFData.expectedCash;
        otherDFData.lastScienceValue = currValue;
      } else {
        e.target.value = otherDFData.lastScienceValue;
      }
    });

  //

  for (const province of provinceData) {
    //
    document
      .getElementById(`${province.provinceId}-numLocalVaccine`)
      .addEventListener("change", (e) => {
        let currValue = parseInt(e.target.value) || 0;
        let diff = currValue - province.lastLocalVaccine;

        if (
          checkConstraint(
            otherDFData.expectedNumLocalVaccine + diff,
            otherData.numLocalVaccine,
            "Không đủ vaccine!"
          )
        ) {
          otherDFData.expectedNumLocalVaccine += diff;
          province.lastLocalVaccine = currValue;
        } else e.target.value = province.lastLocalVaccine;
      });

    //
    document
      .getElementById(`${province.provinceId}-lockdownLevel`)
      .addEventListener("change", (e) => {
        const currValue = parseInt(e.target.value, 10);
        const prevValue = province.lastLockDownLevel;

        if (currValue === prevValue) return;

        const delta = 2 * currValue - 2 * prevValue;

        // Nếu cần thêm tiền (delta > 0) thì kiểm tra, nếu delta <= 0 (hoàn tiền) → cho qua
        if (delta > 0) {
          if (!checkConstraint(delta, otherData.cash)) {
            e.target.value = prevValue;
            return;
          }
        }

        // Áp dụng thay đổi
        otherDFData.expectedCash += delta;
        expectedCashReplacement.textContent = otherDFData.expectedCash;
        province.lastLockDownLevel = currValue;
      });
  }
}

//
export function addActionEvent() {
  document.getElementById("buy-vaccine-btn").addEventListener("click", () => {
    // On-demand purchase
    let numLocalVaccineInput = document.getElementById("purchase-vaccine");
    let numLocalVaccine = Math.floor(
      (parseInt(numLocalVaccineInput.value) *
        (otherData.credit + otherData.numHealth)) /
        200
    );

    // Update num vaccine
    otherData.numGlobalVaccine -= numLocalVaccine;

    document.getElementById("numGlobalVaccine-replacement").innerText =
      otherData.numGlobalVaccine;

    // update cash

    let cost = numLocalVaccineInput.value * otherData.globalVaccinePrice;
    otherDFData.expectedCash -= cost;
    otherData.cash -= cost;
    document.getElementById("cash-replacement").innerText = otherData.cash;
    document.getElementById("expectedCash-replacement").innerText =
      otherDFData.expectedCash;

    // Gift vaccines

    let extraVaccine =
      Math.floor(
        ((otherData.credit + 100 - otherData.numHealth) / 500) *
          otherData.numGlobalVaccine
      ) + randInt(0, 10);

    if (extraVaccine > 0)
      callToast(`Được quốc tế tài trợ thêm ${extraVaccine} vaccine!`);

    otherData.numLocalVaccine += numLocalVaccine + extraVaccine;
    numLocalVaccineInput.value = 0;
    document.getElementById("numLocalVaccine-replacement").innerText =
      otherData.numLocalVaccine;

    //
    otherDFData.lastVaccineValue = 0;
  });

  //
  document.getElementById("invest-btn").addEventListener("click", () => {
    let socialElm = document.getElementById("social-investment");
    let scienceElm = document.getElementById("science-investment");

    // Extra science

    let extraScience = Math.max(
      0,
      Math.floor((otherData.credit / 100) * otherData.numGlobalVaccine)
    );

    if (extraScience > 0)
      callToast(
        `Được quốc tế chuyển giao công nghệ chống dịch (${extraScience} điểm).`
      );

    // Process social and science point

    otherData.social += Math.max(
      0,
      Math.floor((otherData.numHealth / 100) * parseInt(socialElm.value))
    );

    otherData.science += Math.max(
      0,
      Math.floor((otherData.numHealth / 100) * parseInt(scienceElm.value))
    );

    document.getElementById("social-replacement").innerText = otherData.social;
    document.getElementById("science-replacement").innerText =
      otherData.science;

    // Cash

    let cost = parseInt(socialElm.value) + parseInt(scienceElm.value);

    otherData.cash -= cost;
    otherDFData.expectedCash -= cost;

    document.getElementById("cash-replacement").innerText = otherData.cash;
    document.getElementById("expectedCash-replacement").innerText =
      otherDFData.expectedCash;

    //
    socialElm.value = 0;
    scienceElm.value = 0;

    //
    otherDFData.lastScienceValue = 0;
    otherDFData.lastSocialValue = 0;
  });

  //
  document.getElementById("share-vaccine-btn").addEventListener("click", () => {
    for (const province of provinceData) {
      // Vaccine
      otherDFData.expectedNumLocalVaccine = 0;
      province.lastLocalVaccine = 0;

      let sharedVaccineInput = document.getElementById(
        `${province.provinceId}-numLocalVaccine`
      );
      let sharedVaccine = parseInt(sharedVaccineInput.value) || 0;

      province.numLocalVaccine += sharedVaccine;

      otherData.numLocalVaccine -= sharedVaccine;

      document.getElementById("numLocalVaccine-replacement").innerText =
        otherData.numLocalVaccine;

      sharedVaccineInput.value = 0;

      document.getElementById(
        `${province.provinceId}-numCase-replacement`
      ).textContent = Math.max(0, province.numCase - province.numLocalVaccine);

      // Lockdown
      province.lockdownLevel = parseInt(
        document.getElementById(`${province.provinceId}-lockdownLevel`).value
      );
    }
  });
}

export function addEventListeners() {
  addConstraints();
  addActionEvent();
}
