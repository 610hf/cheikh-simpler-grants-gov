import "@testing-library/jest-dom/extend-expect";

import { fireEvent } from "@testing-library/react";
import { axe } from "jest-axe";
import { initialFilterOptions } from "src/utils/testing/fixtures";
import { render, screen } from "tests/react-utils";

import React from "react";

import SearchFilterAccordion from "src/components/search/SearchFilterAccordion/SearchFilterAccordion";

const fakeFacetCounts = {
  grant: 1,
  other: 1,
  procurement_contract: 1,
  cooperative_agreement: 1,
};

const mockUpdateQueryParams = jest.fn();

jest.mock("src/hooks/useSearchParamUpdater", () => ({
  useSearchParamUpdater: () => ({
    updateQueryParams: mockUpdateQueryParams,
  }),
}));

describe("SearchFilterAccordion", () => {
  const title = "Test Accordion";
  const queryParamKey = "fundingInstrument";

  it("should not have basic accessibility issues", async () => {
    const { container } = render(
      <SearchFilterAccordion
        filterOptions={initialFilterOptions}
        title={title}
        queryParamKey={queryParamKey}
        query={new Set()}
        facetCounts={fakeFacetCounts}
      />,
    );
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it("displays the correct checkbox labels", () => {
    render(
      <SearchFilterAccordion
        filterOptions={initialFilterOptions}
        title={title}
        queryParamKey={queryParamKey}
        query={new Set()}
        facetCounts={fakeFacetCounts}
      />,
    );

    expect(screen.getByText("Cooperative Agreement")).toBeInTheDocument();
    expect(screen.getByText("Grant")).toBeInTheDocument();
    expect(screen.getByText("Procurement Contract")).toBeInTheDocument();
    expect(screen.getByText("Other")).toBeInTheDocument();
  });

  it("has hidden attribute when collapsed", () => {
    render(
      <SearchFilterAccordion
        filterOptions={initialFilterOptions}
        title={title}
        queryParamKey={"status"}
        query={new Set()}
        facetCounts={fakeFacetCounts}
      />,
    );

    const accordionToggleButton = screen.getByTestId(
      "accordionButton_opportunity-filter-status",
    );
    const contentDiv = screen.getByTestId(
      "accordionItem_opportunity-filter-status",
    );
    expect(contentDiv).toHaveAttribute("hidden");

    // Toggle the accordion and the hidden attribute should be removed
    fireEvent.click(accordionToggleButton);
    expect(contentDiv).not.toHaveAttribute("hidden");
  });

  it("checks boxes correctly and updates count", () => {
    const { rerender } = render(
      <SearchFilterAccordion
        filterOptions={initialFilterOptions}
        title={title}
        queryParamKey={queryParamKey}
        query={new Set("")}
        facetCounts={fakeFacetCounts}
      />,
    );

    const updatedQuery = new Set("");
    updatedQuery.add("Cooperative Agreement");
    updatedQuery.add("Grant");
    // after clicking one of the boxes, the page should rerender
    // both select all and clear all should be enabled
    rerender(
      <SearchFilterAccordion
        filterOptions={initialFilterOptions}
        title={title}
        queryParamKey={queryParamKey}
        query={updatedQuery}
        facetCounts={fakeFacetCounts}
      />,
    );

    // Verify the count updates to 2
    const countSpan = screen.getByText("2", {
      selector: ".usa-tag.usa-tag--big.radius-pill.margin-left-1",
    });
    expect(countSpan).toBeInTheDocument();
  });
  it("adds an any option checkbox by default", () => {
    render(
      <SearchFilterAccordion
        filterOptions={initialFilterOptions}
        title={title}
        queryParamKey={queryParamKey}
        query={new Set("")}
        facetCounts={fakeFacetCounts}
      />,
    );
    const accordionToggleButton = screen.getByRole("button");
    fireEvent.click(accordionToggleButton);
    const anyCheckbox = screen.getByRole("checkbox", {
      name: "Any test accordion",
    });
    expect(anyCheckbox).toBeInTheDocument();
  });
  it("ensures only the component contents scroll when wrapForScroll is true", () => {
    render(
      <SearchFilterAccordion
        filterOptions={initialFilterOptions}
        title={title}
        queryParamKey={queryParamKey}
        query={new Set("")}
        facetCounts={fakeFacetCounts}
        wrapForScroll={true}
      />,
    );

    const scrollableContainer = screen.getByTestId(`${title}-accordion-scroll`);

    expect(scrollableContainer).toHaveClass("overflow-scroll");

    const initialScrollTop = scrollableContainer.scrollTop;

    fireEvent.scroll(scrollableContainer, { target: { scrollTop: 100 } });

    expect(scrollableContainer.scrollTop).toBeGreaterThan(initialScrollTop);

    // Assert that the document body has not scrolled
    expect(window.scrollY).toBe(0);
  });
});
