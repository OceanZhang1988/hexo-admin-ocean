import React from 'react';
interface IGrammarSuggestionProps {
  suggestion: string;
}
// component for individual grammar suggestion
export class GrammarSuggestion extends React.Component<IGrammarSuggestionProps, any> {
  public render() {
    const suggestion = this.props.suggestion.split('\n');
    let reason: any = suggestion.pop();
    const endStrong = reason.indexOf('" ') + 1;
    reason = (
      <p className="grammar_reason">
        <strong>{reason.substr(0, endStrong)}</strong>{reason.slice(endStrong)}
      </p>
    );

    return (
      <div className="grammar_box">
        {
          suggestion && <pre className="grammar_suggestion">
            {suggestion.join('\n')}
          </pre>
        }
        {reason}
      </div>
    );
  }
}
