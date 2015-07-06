# Feature: Localization of con10t project pages

See also: [Localization of user interface elements](feature_localization.md)

## Preconditions:

Given there is a project "abc" with a german translation.

## Scenario: German User

```gherkin
Given a user has chosen „de“  as his primary browser language.
  And The "abc" project has an english translation.
When the user opens the project page for "abc"-project
Then the title of the project is "Projektseite: abc".
```

## Scenario: British User

```gherkin
Given a user has chosen „en“  as his primary browser language. 
  And The "abc" project has an english translation.
When the user opens the project page for "abc"-project
Then the title of the project is "Project page: abc".
```

## Scenario: Italian User

```gherkin
Given a user has chosen „it“  as his primary browser language. 
  And The "abc" project has an english translation.
  And The "abc" project has an italian translation.
When the user opens the project page for "abc"-project
Then the title of the project is "pagina di progretto: abc".
```

## Scenario: Italian User - missing italian translation

```
Given a user has chosen „it“  as his primary browser language. 
  And The "abc" project has an english translation.
When the user opens the project page for "abc"-project
Then the title of the project is "Project page: abc".
```

## Scenario: Italian User - missing italian and english translation

```gherkin
Given a user has chosen „it“  as his primary browser language. 
When the user opens the project page for "abc"-project
Then the title of the project is "Projektseite: abc".
```

## Scenario: Non German User - missing english translation

```gherkin
Given a user has chosen „da“  as his primary browser language. 
When the user opens the project page for "abc"-project
Then the title of the project is "Projektseite: abc".
```






