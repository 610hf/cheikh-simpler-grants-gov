#!/usr/bin/env python3


import json
import logging

import click

from src.form_schema.dat_to_jsonschema import parse_xls_to_schema
from src.logging import init

logger = logging.getLogger(__name__)


@click.command()
@click.argument("input_file", type=click.Path(exists=True, readable=True, path_type=str))
@click.option(
    "-s",
    "--sheet",
    help="Sheet index to extract (0-based, default is 1 for second sheet)",
    type=int,
    default=1,
    show_default=True,
)
@click.option(
    "-r",
    "--skip-rows",
    help="Number of rows to skip from the top of the sheet (default is 2)",
    type=int,
    default=2,
    show_default=True,
)
@click.option(
    "-o",
    "--output-json",
    help="Path to write the JSON schema file (default: prints to stdout)",
    type=str,
    default=None,
)
@click.option(
    "-u",
    "--output-ui",
    help="Path to write the UI schema file (default: prints to stdout)",
    type=str,
    default=None,
)
def main(input_file: str, sheet: int, skip_rows: int, output_json: str, output_ui: str) -> int:
    """Main entry point for the script."""

    with init("dat_to_jsonschema_cli"):
        try:
            json_schema, ui_schema = parse_xls_to_schema(
                file_path=input_file,
                sheet_index=sheet,
                skip_rows=skip_rows,
            )

            # Handle JSON schema output
            if output_json:
                with open(output_json, "w") as f:
                    json.dump(json_schema, f, indent=4, separators=(",", ": "))
            else:
                print("JSON SCHEMA:")
                print(json.dumps(json_schema, indent=4, separators=(",", ": ")))

            # Handle UI schema output
            if output_ui:
                with open(output_ui, "w") as f:
                    json.dump(ui_schema, f, indent=4, separators=(",", ": "))
            else:
                print("\nUI SCHEMA:")
                print(json.dumps(ui_schema, indent=4, separators=(",", ": ")))

            return 0

        except Exception:
            logger.exception("Process failed")
            raise
