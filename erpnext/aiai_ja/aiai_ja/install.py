# SPDX-License-Identifier: AGPL-3.0-or-later
"""Settings a Japanese site needs. Safe to run again (after every migrate).

Frappe v16 lists only enabled Language records in the setup wizard and the
user settings, and a new site has "ja" disabled, so Japanese cannot be
chosen. The date format is set to the year-first form used in Japan.
"""

import frappe


def after_install():
	if frappe.db.exists("Language", "ja"):
		frappe.db.set_value("Language", "ja", {"enabled": 1, "language_name": "日本語"})
	else:
		frappe.get_doc(
			{"doctype": "Language", "language_code": "ja", "language_name": "日本語", "enabled": 1}
		).insert(ignore_permissions=True)
	settings = frappe.get_single("System Settings")
	if settings.date_format != "yyyy-mm-dd" or frappe.db.get_default("date_format") != "yyyy-mm-dd":
		# Saving the document (not setting the value) also updates the defaults that are used
		settings.date_format = "yyyy-mm-dd"
		settings.flags.ignore_mandatory = True
		settings.save(ignore_permissions=True)
	# The forms and prints read the date format from the defaults
	frappe.db.set_default("date_format", "yyyy-mm-dd")
	frappe.db.commit()
