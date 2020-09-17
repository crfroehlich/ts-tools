Feature: Logger
  In order to trace messages and errors
  As a responsible developer
  I want to log messages from my app to multiple outputs

  Scenario: Logs a message
    Given An info message of "A message"
    When "A message" is given
    Then The logger will output "A message"
