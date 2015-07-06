# Feature: Localization of user interface elements

[Specification](../spec/Transl8ServiceSpec.js)

See also: [Localization of con10t project pages](feature_localization_con10t.md)

## Scenario: Britisch User

```gherkin
Given a user has chosen "en" as his primary browser language.
When the user opens the landing page.
Then the „navbar_about“-Item is entitled „About Arachne“.
```

## Scenario: German User

```gherkin
Given a user has chosen "de" as his primary browser language.
When the user opens the landing page.
Then the „navbar_about“-item is entitled „Über Arachne“.
```

## Scenario: Danish User

```gherkin
Given a user has chosen "da"  as his primary browser language.
When  the user opens the landing page.
Then  the „navbar_about“-item is entitled „About Arachne“.
```

## Scenario: missing translation (english user)

```gherkin
Given a user has chosen "en"  as his primary browser language.
 And the „navbar_about“-item lacks an English translation
When the user opens the landing page.
Then the „navbar_about“-item is entitled „TRL8_MISSING“.
```

## Scenario: missing translation (danish user)

```gherkin
Given a user has chosen "da"  as his primary browser language.
 And the „navbar_about“-item lacks an English translation
When the user opens the landing page.
Then the „navbar_about“-item is entitled „TRL8_MISSING“.
```

## Scenario: missing translation (german user)

```gherkin
Given a user has chosen "de"  as his primary browser language.
 And the „navbar_about“-item lacks an German translation
 When the user opens the landing page.
 Then the „navbar_about“-item is entitled „d „TRL8_MISSING“.
```




