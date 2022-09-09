# The script below will perform the following actions:
# 1. Iterate all the test objects on the cypress/results/reports/metadata/cypress-utils.json report
# 2. It will perform a JQL query in Jira searching for each test
# 3. If test is not found in Jira in will create it
#     3a. Each created test, will be transitioned into the Done status
#     3b. The array of stories tested by that specific test, will be iterated and linked as 'relates to'
# 4. If test is found, it will update it with the following details
#     4a The test labels in Jira, will be compared to those in the report,
#         if an '@' label is not in the report, it will be removed from Jira
#         other labels will not be touched
#     4b A comment will be added with the respective execution details
#     4c. The array of stories tested by that specific test, will be iterated and linked as 'relates to'
# 5. All stories IDs on the report will be updated with respective labels

import os
import requests
import json

CYPRESS_DASHBOARD_ID = os.environ['CYPRESS_DASHBOARD_ID']
JIRA_BASE_URL = os.environ['JIRA_BASE_URL']
JIRA_API_TOKEN = os.environ['JIRA_API_TOKEN']
CYPRESS_DASHBOARD_URL = "https://dashboard.cypress.io/projects"
JIRA_PROJECT_ID = "10000"
TEST_ISSUE_TYPE = "10011"  # ID changes depending on project ID
JIRA_DONE_TRANSITION = "31"
JIRA_HEADERS = {
    "Authorization": "Basic " + JIRA_API_TOKEN,
    "Content-Type": "application/json",
}
JIRA_TESTED_LABELS = [{"add": "tested"}, {"add": "automated"}]
JIRA_TESTED_PAYLOAD = {"update": {"labels": JIRA_TESTED_LABELS}}

# Reading test execution results and metadata report
TEST_CASES_REPORT = open("cypress/results/reports/metadata/cypress-utils.json")
EXECUTION_DATA = json.load(TEST_CASES_REPORT)
TEST_CASES_REPORT.close()

print("------------------------------------------------------------------------------------------------------------------------------------------------------")
# ------------------------------------------------------------------------------------------
# Function Declarations
# ------------------------------------------------------------------------------------------

# Searchs for the jira issue with a JQL Query
def jira_jql_search(jql_query):
    print(f"JQL searching for test: {jql_query}")
    jira_jql_endpoint = (
        JIRA_BASE_URL + "/search?jql=" + jql_query + "&fields=summary, labels, parent"
    )
    jira_jql_response = requests.request(
        "GET", jira_jql_endpoint, headers={"Authorization": "Basic " + JIRA_API_TOKEN}
    )
    print(jira_jql_response.json().get("issues"))
    return jira_jql_response.json().get("issues")

# Returns the new test id
def jira_create_transition_test(issue_name, issue_labels, test_status, issue_desc=""):
    print("------------------------------------------------")
    print(f"Creating Jira issue for test: {issue_name}")
    print("------------------------------------------------")
    test_create_endpoint = JIRA_BASE_URL + "/issue"
    test_create_payload = json.dumps(
        {
            "fields": {
                "project": {"id": JIRA_PROJECT_ID},
                "summary": issue_name,
                "issuetype": {"id": TEST_ISSUE_TYPE},
                "labels": issue_labels,
                "description": f"{issue_name}\n"
                + f"{issue_desc}\n"
                + CYPRESS_DASHBOARD_URL
                + f"/{CYPRESS_DASHBOARD_ID}"
                + "/runs",
            }
        }
    )

    # Creating test case in Jira
    #print(test_create_payload)
    test_create_response = requests.request(
        "POST", test_create_endpoint, headers=JIRA_HEADERS, data=test_create_payload
    )
    print("Status Code: " + str(test_create_response.status_code))
    print(test_create_response.text)
    new_test_id = test_create_response.json().get("key")

    print("------------------------------------------------------------------------------")
    print("Transitioning Jira Test Case " + new_test_id + " into Done status....")
    print("------------------------------------------------------------------------------")
    
    transition_test_endpoint = JIRA_BASE_URL + "/issue/" + new_test_id + "/transitions"
    transition_payload = json.dumps(
        {
            "update": {
                "comment": [
                    {
                        "add": {
                            "body": "# Test Execution\n"
                            + f"test: {issue_name}\n"
                            + f"status: {test_status}\n"
                            + f"video: {CYPRESS_DASHBOARD_URL}/{CYPRESS_DASHBOARD_ID}/runs"
                        }
                    }
                ]
            },
            "transition": {"id": JIRA_DONE_TRANSITION},
        }
    )
    
    print(transition_payload)
    transition_response = requests.request(
        "POST", transition_test_endpoint, headers=JIRA_HEADERS, data=transition_payload
    )
    print("Status Code: " + str(transition_response.status_code))
    print(transition_response.text)

    return new_test_id


def jira_update_test(test_id, test_name, test_status, test_tags):
    print("--------------------------------------------------------------------------")
    print(f"Updating Jira test {test_id}: {test_name}")
    print("--------------------------------------------------------------------------")
    # TO DO - Update description
    update_test_payload = {
            "update": {
                "labels": test_tags,
                "comment": [
                    {
                        "add": {
                            "body": "# Test Execution\n"
                            + f"test: {test_name}\n"
                            + f"status: {test_status}\n"
                            + f"video: {CYPRESS_DASHBOARD_URL}/{CYPRESS_DASHBOARD_ID}/runs"
                        }
                    }
                ],
            }
    }
    if len(test_tags) == 0:
        update_test_payload["update"].pop("labels")

    update_test_endpoint = JIRA_BASE_URL + "/issue/" + test_id + "?notifyUsers=false"
    
    #print(update_test_payload)
    update_test_response = requests.request(
        "PUT", update_test_endpoint, headers=JIRA_HEADERS, data=json.dumps(update_test_payload)
    )
    print("Status Code: " + str(update_test_response.status_code))
    update_test_output = (
        "Test Case: " + test_id + " updated as " + test_status
        if update_test_response.status_code == 204
        else update_test_response.text
    )
    print(update_test_output)


def jira_link_issues(inward_issue, outward_issue):
    print("------------------------------------------------------------------")
    print(f"Test Case {inward_issue} relates to story {story}, creating Jira link...")
    print("------------------------------------------------------------------")
    jira_update_endpoint = (
        JIRA_BASE_URL + "/issue/" + inward_issue + "?notifyUsers=false"
    )
    jira_link_issue_payload = {
        "update": {
            "issuelinks": [
                {
                    "add": {
                        "type": {
                            "name": "Relates",
                            "inward": "relates to",
                            "outward": "relates to",
                        },
                        "outwardIssue": {"key": outward_issue},
                    }
                }
            ]
        }
    }
    
    # print(jira_link_issue_payload)
    jira_update_endpoint = requests.request(
        "PUT",
        jira_update_endpoint,
        headers=JIRA_HEADERS,
        data=json.dumps(jira_link_issue_payload),
    )
    print("Status Code: " + str(jira_update_endpoint.status_code))
    print(jira_update_endpoint.text)

def format_labels_paylod(test_case_current_labels, test_case_new_labels):
    # If test case already exists in Jira, fetching it's labels generated by cypress ('@' first character)
    prev_cypress_labels = []
    labels_to_remove = []

    for label in test_case_current_labels:
        if label[0] == "@":
            prev_cypress_labels.append(label)

    # any @ label not present in metadata report, will be removed
    # if @ label already existed and IS on the report, it will not be touched
    for label in prev_cypress_labels:
        if label in test_case_new_labels:
            test_case_new_labels.remove(label)
        else:
            labels_to_remove.append(label)

    # Creating the payload with labels array
    add_labels_array = []
    if len(test_case_new_labels) != 0:
        for new_label in test_case_new_labels:
            add_label_json = {"add": new_label}
            add_labels_array.append(add_label_json)

    remove_labels_array = []
    for label in labels_to_remove:
        remove_label_json = {"remove": label}
        remove_labels_array.append(remove_label_json)

    update_labels_array = add_labels_array + remove_labels_array
    return update_labels_array

# ------------------------------------------------------------------------------------------
# Main
# ------------------------------------------------------------------------------------------
results_reports = "File Found" if "testInfo" in EXECUTION_DATA else "404 File Not Foound"
print(results_reports)
for index, test_case in enumerate(EXECUTION_DATA["testInfo"]):
    test_name = test_case["title"]
    test_status = test_case["state"]

    # If there's no testSummary on the object, pass an empty string
    test_description = test_case["testSummary"] if "testSummary" in test_case else ""

    add_status_tagg = "passed" if test_status == "passed" else "failed"
    remove_status_tag = "failed" if test_status == "passed" else "passed"

    # JQL Query to find if Test already exists in Jira
    jql_query = 'summary ~ "' + test_name + '"'
    jql_array = jira_jql_search(jql_query)

    # If Test Case is NOT in Jira len == 0, then Create it
    test_case_new_labels = test_case["tags"] if "tags" in test_case else []
    if len(jql_array) == 0:
        # Include test status label in jira Story?
        test_create_labels = ["test_case", "automated"] + test_case_new_labels

        new_test_id = jira_create_transition_test(
            test_name, test_create_labels, test_status, test_description
        )

        # Linking test case to tested stories
        tested_stories_list = test_case["testedIds"] if "testedIds" in test_case else []
        for story in tested_stories_list:
            jira_link_issues(new_test_id, story)

    # If Test Case IS in Jira, just update labels with tags, the test status as a label, add an execution comment
    else:
        current_labels = jql_array[0]["fields"]["labels"]
        update_labels_array = format_labels_paylod(current_labels, test_case_new_labels)

        # Updating the found test case with labels and execution data
        test_id = jql_array[0].get("key")

        jira_update_test(test_id, test_name, test_status, update_labels_array)

        # Linking test case with tested stories in Jira
        tested_stories_list = test_case["testedIds"] if "testedIds" in test_case else []
        for story in tested_stories_list:
            jira_link_issues(test_id, story)

    # Updating tested stories with respective labels
    edit_story_payload = {**JIRA_TESTED_PAYLOAD}
    edit_story_payload["update"]["labels"] = []
    edit_story_payload["update"]["labels"] = JIRA_TESTED_LABELS + [
        {"add": add_status_tagg},
        {"remove": remove_status_tag},
    ]

    # Getting tested Jira stories from test case properties
    tested_stories_list = test_case["testedIds"] if "testedIds" in test_case else []
    if len(tested_stories_list) != 0:
        for story in tested_stories_list:
            print("-----------------------------------------------------------------------------------")
            print(
                f"Updating tested story {story} with test status, tested and automation labels"
            )
            print("----------------------------------------------------------------------------------")

            jira_edit_endpoint = JIRA_BASE_URL + "/issue/" + story + "?notifyUsers=false"
            jira_edit_reponse = requests.request(
                "PUT",
                jira_edit_endpoint,
                headers=JIRA_HEADERS,
                data=json.dumps(edit_story_payload),
            )
            print("Status Code: " + str(jira_edit_reponse.status_code))
            print(jira_edit_reponse.text)
