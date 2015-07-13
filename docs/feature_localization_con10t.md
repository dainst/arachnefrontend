# Feature: Localization of con10t project pages

[Specification](../spec/controllers_projects_spec.js)

It describes the behaviour of the projects overview page.
From there, the project title links lead to specific project pages,
which appear in the same language in which the project title is shown.


See also: [Localization of user interface elements](feature_localization.md)

## Background:

```gherkin
Given there is a project "abc" with a german translation.
  And the project is listed on the projects page.
```

## Scenario: German User

```gherkin
Given a user has chosen "de"  as his primary browser language.
  And The "abc" project has an english translation.
Then the title of the project is "Projektseite: abc".
```

## Scenario: British User

```gherkin
Given a user has chosen "en"  as his primary browser language. 
  And The "abc" project has an english translation.
Then the title of the project is "Project page: abc".
```

## Scenario: Italian User

```gherkin
Given a user has chosen "it"  as his primary browser language. 
  And The "abc" project has an english translation.
  And The "abc" project has an italian translation.
Then the title of the project is "pagina di progretto: abc".
```

## Scenario: Italian User - missing italian translation

```gherkin
Given a user has chosen "it"  as his primary browser language. 
  And The "abc" project has an english translation.
Then the title of the project is "Project page: abc".
```

## Scenario: Italian User - missing italian and english translation

```gherkin
Given a user has chosen "it"  as his primary browser language.
Then the title of the project is "Projektseite: abc".
```

## Scenario: British - missing english translation

```gherkin
Given a user has chosen "en"  as his primary browser language.
Then the title of the project is "Projektseite: abc".
```






