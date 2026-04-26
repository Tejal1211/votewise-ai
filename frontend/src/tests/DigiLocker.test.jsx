import { render, screen } from "@testing-library/react";
import DigiLocker from "../pages/DigiLocker";

describe("DigiLocker Page", () => {
  it("renders the DigiLocker connect screen", () => {
    render(<DigiLocker />);
    expect(screen.getByRole("heading", { name: /DigiLocker Connect/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Connect to DigiLocker/i })).toBeInTheDocument();
  });
});
