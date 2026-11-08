
import csv

from decimal import Decimal
from pathlib import Path

from django.core.management.base import BaseCommand, CommandError
from django.db import transaction

from api.models import Route


class Command(BaseCommand):
    help = "Import ordered bus route coordinates from a text file"

    def add_arguments(self, parser):
        parser.add_argument("file_path", type=str)
        parser.add_argument(
            "--replace",
            action="store_true",
            help="Delete existing route coordinates before importing",
        )

    @transaction.atomic
    def handle(self, *args, **options):
        file_path = Path(options["file_path"])

        if not file_path.is_file():
            raise CommandError(f"File not found: {file_path}")

        points = []

        with file_path.open("r", encoding="utf-8-sig") as file:
            for line_number, line in enumerate(file, start=1):
                line = line.strip()

                if not line:
                    continue

                parts = next(csv.reader([line], skipinitialspace=True))

                if len(parts) < 2:
                    raise CommandError(
                        f"Invalid coordinate at line {line_number}"
                    )

                try:
                    latitude = Decimal(parts[0].strip())
                    longitude = Decimal(parts[1].strip())
                except Exception as exc:
                    raise CommandError(
                        f"Invalid numbers at line {line_number}"
                    ) from exc

                if not (-90 <= latitude <= 90):
                    raise CommandError(
                        f"Invalid latitude at line {line_number}"
                    )

                if not (-180 <= longitude <= 180):
                    raise CommandError(
                        f"Invalid longitude at line {line_number}"
                    )

                name = ",".join(parts[2:]).strip() if len(parts) > 2 else ""

                points.append({
                    "name": name,
                    "latitude": latitude,
                    "longitude": longitude,
                    "order": len(points) + 1,
                })

        if not points:
            raise CommandError("No coordinates found in the file")

        if options["replace"]:
            Route.objects.all().delete()

        Route.objects.bulk_create([
            Route(**point) for point in points
        ])

        stops = sum(bool(point["name"]) for point in points)

        self.stdout.write(self.style.SUCCESS(
            f"Imported {len(points)} coordinates, "
            f"including {stops} named bus stops."
        ))
